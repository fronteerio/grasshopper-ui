/*!
 * Copyright 2014 Digital Services, University of Cambridge Licensed
 * under the Educational Community License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['exports', 'moment', 'bootstrap-notify'], function(exports, moment) {


    /////////////////
    //  CONSTANTS  //
    /////////////////

    // Store the shorthand names of the weekdays
    var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Keep track of number of milliseconds in a day, week and month for use in the calendar
    var PERIODS = {
        'day': 1000 * 60 * 60 * 24,
        'week': 1000 * 60 * 60 * 24 * 7,
        'month': 1000 * 60 * 60 * 24 * 7 * 30,
    };


    ////////////////
    //  CALENDAR  //
    ////////////////

    /**
     * Add a leading zero to a digit
     *
     * @param  {Number}    digit    The digit that needs to be extended with an extra zero, if necessary
     * @return {Number}             The extended digit
     */
    var addLeadingZero = exports.addLeadingZero = function(digit) {
        if (!_.isNumber(digit)) {
            throw new Error('An invalid digit has been provided');
        }

        // Convert the digit to a string
        digit = String(digit);

        // Add a leading zero if the length of the string equals 1
        if (digit.length === 1) {
            digit = '0' + digit;
        }
        return digit;
    };

    /**
     * Convert an ISO8601 date to a UNIX date
     *
     * @param  {String}    date    The ISO8601 date that needs to be converted to a UNIX date format
     * @return {Number}            The UNIX date
     */
    var convertISODatetoUnixDate = exports.convertISODatetoUnixDate = function(date) {
        if (!date || !_.isString(date) || !moment(date, 'YYYY-MM-DD').isValid()) {
            throw new Error('An invalid value for date has been provided');
        }
        return Date.parse(date);
    };

    /**
     * Convert a UNIX date to an ISO8601 date
     *
     * @param  {String}    date    The UNIX date that needs to be converted to an ISO8601 date format
     * @return {Number}            The ISO8601 date
     */
    var convertUnixDatetoISODate = exports.convertUnixDatetoISODate = function(date) {
        if (!date || !moment(date, 'x').isValid()) {
            throw new Error('An invalid value for date has been provided');
        }
        return new Date(date).toISOString();
    };

    /**
     * @param  {String}    startDate    The start date of the event in UTC format (e.g. 2014-10-07T08:00:00.000Z)
     * @param  {String}    endDate      The end date of the event in UTC format (e.g. 2014-10-07T11:00:00.000Z)
     * @return {String}                 The converted date in display format (e.g. 'W7 • Fri 2–3pm')
     */
    var generateDisplayDate = exports.generateDisplayDate = function(startDate, endDate) {
        if (!_.isString(startDate) || !moment(startDate, 'YYYY-MM-DD').isValid()) {
            throw new Error('A valid start date should be provided');
        } else if (!_.isString(endDate) || !moment(endDate, 'YYYY-MM-DD').isValid()) {
            throw new Error('A valid end date should be provided');
        }

        var weekNumber = 'OT';
        if (getTerm(convertISODatetoUnixDate(moment(startDate).utc().format('YYYY-MM-DD')), true)) {
            weekNumber = getAcademicWeekNumber(convertISODatetoUnixDate(moment(startDate).utc().format('YYYY-MM-DD')));
            /* istanbul ignore else */
            if (weekNumber) {
                weekNumber = 'W' + weekNumber;
            }
        }

        // Retrieve the day
        var weekDay = moment(endDate).utc().format('E');
        weekDay = DAYS[weekDay - 1];

        // Retrieve the meridien values
        var startMeridien = moment(startDate).utc().format('a');
        var endMeridien = moment(endDate).utc().format('a');

        // Compose the start part
        var startParts = [];
        startParts.push(moment(startDate).utc().format('h'));
        var startMinutes = moment(startDate).utc().format('mm');
        if (parseInt(startMinutes, 10)) {
            startParts.push(':' + startMinutes);
        }
        if (startMeridien !== endMeridien) {
            startParts.push(startMeridien);
        }
        startParts = startParts.join('');

        // Compose the end part
        var endParts = [];
        endParts.push(moment(endDate).utc().format('h'));
        var endMinutes = moment(endDate).utc().format('mm');
        if (parseInt(endMinutes, 10)) {
            endParts.push(':' + endMinutes);
        }
        endParts.push(endMeridien);
        endParts = endParts.join('');

        // Return the display date
        return String(weekNumber + ' · ' + weekDay + ' ' + startParts + '-' + endParts);
    };

    /**
     * Return the current academic week number if the current date is within a term
     *
     *  * To calculate the academic week number we first need to calculate
     *  * the difference between the current calendar date and the start of the term.
     *  *
     *  * Note that a term always start on a Tuesday and academic weeks start on Thursdays!
     *  *
     *  * E.g: calendar date: Wed 2015-02-11T13:54:35.000Z => 1423662834000 (week 5)
     *  *      start of term: Thu 2015-01-13T00:00:00.000Z => 1421107200000 (week 1)
     *  *
     *  * This means that the first academic week start on Tuesday, 13/01/2015 and ends on Wednesday, 14/01/2015.
     *  * The second week will start on Thursday, 15/01/2015 and end on Wednesday 21/01/2015.
     *  *
     *  * After we calculated the difference between the current date and the start of the term,
     *  * we need the number of weeks:
     *  *
     *  *   weeks = (calendar date - term start) / (week in milliseconds)
     *  *   weeks = (1423662834000 - 1421107200000) / (week in milliseconds)
     *  *   weeks = 4.226...
     *  *
     *  * We need to subtract an offset from our result, since there is a difference of
     *  * 2 days between the start of the term (Tue) and the start of the academic weeks (Thu).
     *  *
     *  *   offset = ((1 / 7) * (day number))
     *  *   offset = ((1 / 7) * 2)
     *  *   offset = 0.286...
     *  *
     *  * To determine which week we're currently in, we subtract the offset from the number of weeks.
     *  * We need to add one week, since we're doing a zero-based numbering.
     *  *
     *  *   week = (weeks - offset) + 1
     *
     * @param  {Number}    date     The date where the academic week number needs to be returned for
     * @return {Number}             The academic week number
     */
    var getAcademicWeekNumber = exports.getAcademicWeekNumber = function(date) {
        if (!_.isNumber(date)) {
            throw new Error('A valid date should be provided');
        }

        // Get the configuration
        var config = require('gh.core').config;
        // Get the correct terms associated to the current application
        var terms = config.terms[config.academicYear];

        // Retrieve the corresponding term of the specified date
        var currentTerm = getTerm(date);
        if (!currentTerm) {
            return 0;
        }

        // Get the start date of the corresponding term
        var startDate = convertISODatetoUnixDate(moment(currentTerm.start).utc().format());

        // Retrieve the day number of the first day of the term
        var dayNumber = parseInt(moment(startDate).format('E'), 10);

        // Since the terms start on a Tuesday we have an offset of 2 days.
        // The 0.01 we subtract is just a hack that allows us to ceil
        // the result of the last calculation before returning the week number,
        // since this will always result in a integer value
        var dayOffset = ((1 / 7) * dayNumber) - 0.01;

        // Calculate and return the current academic week number
        return Math.ceil(((date - startDate) / PERIODS['week']) - (dayOffset)) + 1;
    };

    /**
     * Return the current term if the current date is within a term
     *
     * @param  {Number}     date          The date in a UNIX time format
     * @param  {Boolean}    usePrecise    Whether of not an offset should be used. (Default: false)
     * @return {Object}                   The term that has the specified date in its range
     */
    var getTerm = exports.getTerm = function(date, usePrecise) {
        if (!_.isNumber(date)) {
            throw new Error('A valid date should be provided');
        } else if (usePrecise && !_.isBoolean(usePrecise)) {
            throw new Error('A valid value for usePrecise should be provided');
        }

        // Get the configuration
        var config = require('gh.core').config;
        // Get the correct terms associated to the current application
        var terms = config.terms[config.academicYear];

        // Get the current term and return its name
        return _.find(terms, function(term) {

            // Convert the dates from ISO to UNIX for easier calculation
            var startDate = convertISODatetoUnixDate(moment(term.start).utc().format());
            var endDate = convertISODatetoUnixDate(moment(term.end).utc().format());

            // Only use an offset for the week calculation when specified
            if (!usePrecise) {

                // We consider weeks that only count 2 days as full academic weeks.
                // E.g. A term starts on Tuesday 13th February, but the academic weeks always start on a Thursday.
                //      This means that the first academic week of that term starts on the 13th and ends on the 14th.
                //      The second academic week will start on Thursday 15th February.
                var datePlus = convertISODatetoUnixDate(moment(date).add({'days': 6}).utc().format());
                /* istanbul ignore else */
                if (date < startDate && datePlus >= startDate) {
                    date = datePlus;
                }
            }

            // Return the term where the specified date is within the range
            if (isDateInRange(date, startDate, endDate)) {
                return term;
            }
        });
    };

    /**
     * Get the Date of the first day of the specified term
     *
     * @param  {String}    termName    The name of the term to get the date of the first day for
     * @return {Date}                  The date of the first day of the term
     */
    var getFirstDayOfTerm = exports.getFirstDayOfTerm = function(termName) {
        if (!_.isString(termName)) {
            throw new Error('A valid term name should be provided');
        }

        // Get the configuration
        var config = require('gh.core').config;
        // Get the correct terms associated to the current application
        var terms = config.terms[config.academicYear];
        // Find the term to get the first day's date for
        var term =_.find(terms, function(term) {
            /* istanbul ignore else */
            if (term.name === termName) {
                // Return the term
                return term;
            }
        });

        // Return the first day's date
        return new Date(term.start);
    };

    /**
     * Get the number of weeks in a term
     *
     * @param  {Object}    term    The term to get the number of weeks for
     * @return {Number}            The number of weeks in the term
     */
    var getWeeksInTerm = exports.getWeeksInTerm = function(term) {
        if (!_.isObject(term)) {
            throw new Error('A valid term should be provided');
        }

        // Convert the term start and end date to milliseconds
        var termStartDate = new Date(term.start).getTime();
        var termEndDate = new Date(term.end).getTime();
        // Calculate the time difference
        var timeDifference = Math.abs(termEndDate - termStartDate);
        // Convert to weeks and return
        return Math.ceil(timeDifference / PERIODS['week']) + 1;
    };

    /**
     * Get a date by specifying the term it's in, the week number it's in and the day of the week it is
     *
     * @param  {String}    termName      The name of the term to look for the date
     * @param  {Number}    weekNumber    The week of the term to look for the date
     * @param  {Number}    dayNumber     The day of the week to look for the dae
     * @return {Date}                    Date object of the day in the term
     */
    var getDateByWeekAndDay = exports.getDateByWeekAndDay = function(termName, weekNumber, dayNumber) {
        if (!_.isString(termName)) {
            throw new Error('A valid term name should be provided');
        } else if (!_.isNumber(weekNumber)) {
            throw new Error('A valid week number should be provided');
        } else if (!_.isNumber(dayNumber)) {
            throw new Error('A valid day number should be provided');
        }

        // Get the configuration
        var config = require('gh.core').config;
        // Get the correct terms associated to the current application
        var terms = config.terms[config.academicYear];
        // Variable used to assign the date by week and day to and return
        var dateByWeekAndDay = null;

        // Loop over the terms
        _.each(terms, function(term) {
            if (term.name === termName) {
                // Get the date on which the term starts
                var termStartDate = new Date(term.start).getTime();

                // Calculate the week offset in milliseconds
                var weekOffset = (weekNumber - 1) * PERIODS['week'];
                // Calculate the start date of the week
                var startOfWeekDate = new Date(termStartDate + weekOffset);
                // Find out what day this day is
                var startOfWeekDay = startOfWeekDate.getDay();

                // If the dayNumber is smaller than the day the week starts on,
                // add a week to the weekOffset and substract the difference in days
                if (dayNumber < startOfWeekDay) {
                    startOfWeekDate = startOfWeekDate.getTime() + PERIODS['week'];
                    // Remove x days from the week to get to the final date to return
                    dateByWeekAndDay = startOfWeekDate - ((startOfWeekDay - dayNumber) * PERIODS['day']);

                // If the dayNumber is larger than the day, just add the difference
                } else {
                    // Add x days to the week to get to the final date to return
                    dateByWeekAndDay = startOfWeekDate.getTime() + ((dayNumber - startOfWeekDay) * PERIODS['day']);
                }

                dateByWeekAndDay = new Date(dateByWeekAndDay);
            }
        });

        // return the Date object
        return dateByWeekAndDay;
    };

    /**
     * All the functionality related to date displaying
     *
     * @param  {String}    date    The date in UTC format
     * @return {Object}            Object containing dateDisplay functions
     */
    var dateDisplay = exports.dateDisplay = function(date) {

        /**
         * Returns the day from a UTC string
         *
         * @return {Number}
         */
        var dayNumber = function() {
            if (!_.isString(date) || !moment(date, 'YYYY-MM-DD').isValid()) {
                throw new Error('A valid date should be provided');
            }
            return parseInt(moment(date).utc().format('D'), 10);
        };

        /**
         * Returns the month from a UTC tring
         *
         * @return {String}
         */
        var monthName = function() {
            if (!_.isString(date) || !moment(date, 'YYYY-MM-DD').isValid()) {
                throw new Error('A valid date should be provided');
            }
            return MONTHS[moment(date).utc().format('M') - 1];
        };

        return {
            'dayNumber': dayNumber,
            'monthName': monthName
        };
    };

    /**
     * Convert a date to GMT+0 for display in the calendar
     *
     * @param  {String}    date    The date that needs conversion
     * @return {Number}            The converted date in a UNIX format
     */
    var fixDateToGMT = exports.fixDateToGMT = function(date) {
        if (!_.isString(date) || !moment(date, 'YYYY-MM-DD').isValid()) {
            throw new Error('A valid date should be provided');
        }
        return (new Date(date)).getTime() - ((new Date(date)).getTimezoneOffset() * 60000);
    };

    /**
     * Convert start and end times of an event to GMT+0 for display in the calendar
     *
     * @param  {Object[]}    events    An Array of events to fix start and end date to GTM+0 for
     */
    var fixDatesToGMT = exports.fixDatesToGMT = function(events) {
        if (!_.isArray(events)) {
            throw new Error('A valid array should be provided');
        }
        _.each(events, function(ev) {
            ev.start = fixDateToGMT(ev.start);
            ev.end = fixDateToGMT(ev.end);
        });
    };

    /**
     * Get the date range the calendar should be displaying. The date is determined by the calendar's current view.
     *
     *  * Day:
     *  * We only fetch the events that occur in a 24 hour time frame based on the current day
     *
     *  * Week:
     *  * We fetch the events that occur one week before and after the current view's date
     *
     *  * Month:
     *  * We fetch the events that occur one month before and after the current view's date
     *
     * @param  {Function}   callback            Standard callback function
     * @param  {Object}     callback.range      Object containg start and end date that form the range of the calendar
     */
    /* istanbul ignore next */
    var getCalendarDateRange = exports.getCalendarDateRange = function(callback) {

        // Create the range object to return
        var range = {
            'start': null,
            'end': null
        };

        /**
         * TODO: move the dispatching of events to actual UI files
         */

        // Fetch the calendar's current view type
        $(document).trigger('gh.calendar.getCurrentView', function(currentView) {

            // Fetch the calendar's current view date
            $(document).trigger('gh.calendar.getCurrentViewDate', function(currentViewDate) {

                // Calculate the start date
                range.start = convertUnixDatetoISODate(currentViewDate - PERIODS[currentView]);

                // Calculate the end date
                range.end = convertUnixDatetoISODate(currentViewDate + PERIODS[currentView]);

                // Return the range object
                return callback(range);
            });
        });
    };

    /**
     * Determine whether or not a given date is in the range of 2 dates
     *
     * @param  {Number}    date         The date in UNIX format
     * @param  {Number}    startDate    The start of the date range in UNIX format
     * @param  {Number}    endDate      The end of the date range in UNIX format
     * @return {Boolean}                Whether or not the date is in the range
     */
    var isDateInRange = exports.isDateInRange = function(date, startDate, endDate) {
        if (!date || !moment(date, 'x').isValid()) {
            throw new Error('An invalid value for date has been provided');
        } else if (!startDate || !moment(startDate, 'x').isValid()) {
            throw new Error('An invalid value for startDate has been provided');
        } else if (!endDate || !moment(endDate, 'x').isValid()) {
            throw new Error('An invalid value for endDate has been provided');
        } else if (startDate > endDate) {
            throw new Error('The startDate cannot be after the endDate');
        }

        return (date >= startDate && date <= endDate);
    };

    /**
     * Return the number of weeks within a date range
     *
     * @param  {Number}    startDate    The start of the date range in UNIX format
     * @param  {Number}    endDate      The end of the date range in UNIX format
     * @return {Number}                 The number of weeks within the date range
     */
    var weeksInDateRange = exports.weeksInDateRange = function(startDate, endDate) {
        if (!startDate || !moment(startDate, 'x').isValid()) {
            throw new Error('An invalid value for startDate has been provided');
        } else if (!endDate || !moment(endDate, 'x').isValid()) {
            throw new Error('An invalid value for endDate has been provided');
        } else if (startDate > endDate) {
            throw new Error('The startDate cannot be after the endDate');
        }

        // Calculate the difference between the two dates and return the number of weeks
        var difference = endDate - startDate;
        return Math.round(difference / (60 * 60 * 24 * 7));
    };

    /**
     * Put the terms and their events into an chronologically ordered array.
     *
     *  *   Instead of using the following object in our view, where all the
     *  *   out of term events are grouped into a single object;
     *  *
     *  *   {
     *  *       'Michaelmas': {
     *  *           'events': [Object, Object, Object]
     *  *       },
     *  *       'Lent': {
     *  *           'events': [Object]
     *  *       },
     *  *       'Easter': {
     *  *           'events': [Object, Object]
     *  *       },
     *  *       'OT': {
     *  *           'events': [Object, Object, Object, Object]
     *  *       },
     *  *
     *  *   }
     *  *
     *  *   We want to have an array where all the terms and events
     *  *   are ordered chronologically;
     *  *
     *  *   [
     *  *       {
     *  *           'name'  : 'OT'
     *  *           'events': [Object, Object]
     *  *       },
     *  *       {
     *  *           'name'  : 'Michaelmas'
     *  *           'events': [Object, Object, Object]
     *  *       },
     *  *       {
     *  *           'name'  : 'OT'
     *  *           'events': [Object, Object]
     *  *       },
     *  *       {
     *  *           'name'  : 'Lent'
     *  *           'events': [Object]
     *  *       },
     *  *       {
     *  *           'name'  : 'Easter'
     *  *           'events': [Object, Object]
     *  *       }
     *  *   ]
     *
     * @param  {terms}     terms    The terms that should be reordered
     * @return {Object}             Object containing the reordered terms and events
     */
    var orderEventsByTerm = exports.orderEventsByTerm = function(terms) {
        if (!_.isObject(terms)) {
            throw new Error('An invalid value for terms has been provided');
        }

        // Create a temporary array for the terms
        var _terms = [];
        _.each(terms, function(term, name) {
            if (name !== 'OT') {
                _terms.push({
                    'name': name,
                    'start': moment(term.start).utc().format(),
                    'end': moment(term.end).utc().format(),
                    'events': term.events
                });
            }
        });

        // Create a term for every out of term event
        /* istanbul ignore else */
        if (terms['OT']) {
            _.each(terms['OT'].events, function(event) {
                _terms.push({
                    'name': 'OT',
                    'start': moment(event.start).utc().format(),
                    'events': [event]
                });
            });
        }

        // Order the terms chronologically
        terms = _.sortBy(_terms, function(term) { return convertISODatetoUnixDate(term.start); });

        // Group the OT events
        var _eventsGroup = null;
        var _tempTerms = [];
        _.each(terms, function(term, index) {
            if (term['name'] === 'OT') {
                /* istanbul ignore else */
                if (!_eventsGroup) {
                    _eventsGroup = [];
                }
                _eventsGroup = _.union(_eventsGroup, term.events);
                /* istanbul ignore else */
                if (!terms[index + 1] || terms[index + 1]['name'] !== 'OT') {
                    _tempTerms.push({
                        'name': 'OT',
                        'start':  _.first(_eventsGroup)['start'],
                        'end': _.last(_eventsGroup)['end'],
                        'events': _eventsGroup
                    });
                    _eventsGroup = null;
                }
            } else {
                _tempTerms.push(term);
            }
        });
        return _tempTerms;
    };

    /**
     * Split up a given Array of events into separate Arrays per term. Returns an object with
     * keys being the term label and values the Array of events associated to that term
     *
     * @param  {Event[]}    events    The Array of events to split up into terms
     * @return {Object}               Object representing the split up terms and events
     */
    var splitEventsByTerm = exports.splitEventsByTerm = function(events) {
        if (!_.isObject(events)) {
            throw new Error('An invalid value for events has been provided');
        }

        // Get the configuration
        var config = require('gh.core').config;
        // Get the correct terms associated to the current application
        var terms = config.terms[config.academicYear];
        // Create the object to return
        var eventsByTerm = {};

        // Transform the start and end dates in the terms to proper Date objects so we can
        // compare them to the start times of the events. Also add a key to the object to
        // return in which we will add the triaged events
        _.each(terms, function(term) {
            // Convert start and end strings into proper dates for comparison
            term.start = new Date(term.start);
            term.end = new Date(term.end);
            // Add an Array to the object to return with the term label as the key
            eventsByTerm[term.label] = {
                'start': term.start,
                'end': term.end,
                'events': []
            };
        });

        // Loop over the array of events to triage them
        _.each(events.results, function(ev) {
            var outOfTerm = true;
            // Convert start date into proper date for comparison
            var evStart = new Date(ev.start);
            // Loop over the terms and check whether the event start date
            // falls between the term start and end date. If it does, push
            // it into the term's Array
            _.each(terms, function(term) {
                var eventStartDay = convertISODatetoUnixDate(moment(evStart).utc().format('YYYY-MM-DD'));
                if (evStart >= term.start && eventStartDay <= term.end) {
                    outOfTerm = false;
                    // The event takes place in this term, push it into the Array
                    eventsByTerm[term.label]['events'].push(ev);
                }
            });
            // Add the out of terms to a separate array
            if (outOfTerm) {
                /* istanbul ignore else */
                if (!eventsByTerm['OT']) {
                    eventsByTerm['OT'] = {
                        'events': []
                    };
                }
                eventsByTerm['OT']['events'].push(ev);
            }
        });

        // Return the resulting object
        return eventsByTerm;
    };


    ///////////////
    //  GENERAL  //
    ///////////////

    /**
     * Generates a random 10 character sequence of upper and lowercase letters.
     *
     * @param  {Boolean}    toLowerCase    Whether or not the string should be returned lowercase
     * @return {String}                    Random 10 character sequence of upper and lowercase letters
     */
    var generateRandomString = exports.generateRandomString = function(toLowerCase) {
        if (toLowerCase && !_.isBoolean(toLowerCase)) {
            throw new Error('An invalid value for toLowerCase has been provided');
        }

        // Generate a random string
        var rndString = _.sample('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10).join('');
        if (toLowerCase) {
            rndString = rndString.toLowerCase();
        }
        return rndString;
    };

    /**
     * Mock a XMLHttpRequest
     *
     * @param  {String}           type           The request type. (e.g. 'GET', 'POST'...)
     * @param  {String}           url            The request url
     * @param  {Number}           statusCode     The response status code (e.g. 200, 400, 503...)
     * @param  {Object}           headers        The response headers
     * @param  {Object|String}    body           The response body
     * @param  {Function}         requestFunc    The mock function
     */
    var mockRequest = exports.mockRequest = function(type, url, statusCode, headers, body, requestFunc) {
        if (!_.isString(type)) {
            throw new Error('An invalid value for type was provided');
        } else if (!_.isString(url)) {
            throw new Error('An invalid value for url was provided');
        } else if (!_.isNumber(statusCode)) {
            throw new Error('An invalid value for statusCode was provided');
        } else if (!_.isObject(headers)) {
            throw new Error('An invalid value for headers was provided');
        } else if (_.isEmpty(body)) {
            throw new Error('An invalid value for body was provided');
        } else if (!_.isFunction(requestFunc)) {
            throw new Error('An invalid value for callback was provided');
        }

        // Stringify the response body
        body = JSON.stringify(body);

        // Require Sinon before continuing
        require(['sinon'], function(sinon) {
            var server = sinon.fakeServer.create();
            server.respondWith(type, url, [statusCode, headers, body]);

            // Execute the request
            requestFunc();

            // Mock the response
            server.respond();
            server.restore();
        });
    };

    /**
     * Sort given objects based on the displayName property.
     * The list will be ordered from A to Z.
     *
     * @see Array#sort
     */
    var sortByDisplayName = exports.sortByDisplayName = function(a, b) {
        if (a.displayName.toLowerCase() < b.displayName.toLowerCase()){
            return -1;
        } else if (a.displayName.toLowerCase() > b.displayName.toLowerCase()) {
            return 1;
        }
        return 0;
    };

    /**
     * Sort given objects based on the host property.
     * The list will be ordered from A to Z.
     *
     * @see Array#sort
     */
    var sortByHost = exports.sortByHost = function(a, b) {
        if (a.host.toLowerCase() < b.host.toLowerCase()){
            return -1;
        } else if (a.host.toLowerCase() > b.host.toLowerCase()) {
            return 1;
        }
        return 0;
    };


    ////////////////////////
    //  GOOGLE ANALYTICS  //
    ////////////////////////

    /**
     * Set up Google Analytics tracking. Note that this is using Universal Tracking
     *
     * @private
     */
    /* istanbul ignore next */
    var googleAnalytics = function() {
        (function(i,s,o,g,r,a,m) {i['GoogleAnalyticsObject']=r;i[r]=i[r]||function() {
        (i[r].q=i[r].q||[]).push(arguments);};i[r].l=1*new Date();a=s.createElement(o);
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        // Add hostname to allow tracking of accessed tenant
        ga('create', 'UA-57660493-1', window.location.hostname);
        ga('send', 'pageview');

        // Add event handler to track JavaScript errors
        window.addEventListener('error', function(ev) {
            ga('send', 'event', 'JavaScript Error', 'log', ev.message + ' [' + ev.filename + ':  ' + ev.lineno + ']');
        });

        // Add event handler to track jQuery AJAX errors
        $(document).ajaxError(function(ev, request, settings, err) {
            ga('send', 'event', 'Ajax Error', 'log', settings.type + ' ' + settings.url + ' => ' + err + ' (' + request.status + ')');
        });
    };

    /**
     * Register a Google Analytics tracking event
     * (https://developers.google.com/analytics/devguides/collection/analyticsjs/events#overview)
     *
     * @param  {String}    category      Typically the object that was interacted with (e.g. button)
     * @param  {String}    action        The type of interaction (e.g. click)
     * @param  {String}    label         Useful for categorizing events (e.g. nav buttons)
     * @param  {Number}    [value]       Value of the action, values must be non-negative
     */
    var sendTrackingEvent = exports.sendTrackingEvent = function(category, action, label, value) {
        if (!_.isString(category)) {
            throw new Error('An invalid value for \'category\' has been provided');
        } else if (!_.isString(action)) {
            throw new Error('An invalid value for \'action\' has been provided');
        } else if (!_.isString(label)){
            throw new Error('An invalid value for \'label\' has been provided');
        } else if (value && !_.isNumber(value)) {
            throw new Error('An invalid value for \'value\' has been provided');
        }

        // Only send the value along when it's specified
        /* istanbul ignore next */
        if (value) {
            ga('send', 'event', category, action, label, value);
        } else {
            ga('send', 'event', category, action, label);
        }

        return true;
    };


    ///////////////////
    // LOCAL STORAGE //
    ///////////////////

    /**
     * All the functionality related to local storage
     *
     * @return  {Object}    Object containing the local storage functionality
     */
    var localDataStorage = exports.localDataStorage = function() {

        /**
         * Return a value from the local storage
         *
         * @param  {String}                 key    The key of the value that needs to be retrieved from the local storage
         * @return {Object|Array|String}           The requested value
         */
        var get = function(key) {
            if (!_.isString(key)) {
                throw new Error('An invalid value for \'key\' was provided');
            }

            // Return an entry from the local storage
            return JSON.parse(localStorage.getItem(key));
        };

        /**
         * Remove a local value
         *
         * @param  {String}     key      The key of the entry that needs to be stored
         * @return {undefined}
         */
        var remove = function(key) {
            if (!_.isString(key)) {
                throw new Error('An invalid value for \'key\' was provided');
            }

            // Remove the entry from the local storage
            return localStorage.removeItem(key);
        };

        /**
         * Store a value in the local storage
         *
         * @param  {String}                 key      The key of the entry that needs to be stored
         * @param  {Object|Array|String}    value    The value of the key that needs to be stored
         * @return {undefined}
         */
        var store = function(key, value) {
            if (!_.isString(key)) {
                throw new Error('An invalid value for \'key\' was provided');
            }

            // Add the entry to the local storage
            try {
                return localStorage.setItem(key, JSON.stringify(value));
            } catch(err) {
                throw new Error('An invalid value was provided');
            }
        };

        return {
            'get': get,
            'remove': remove,
            'store': store
        };
    };


    ///////////////////
    // NOTIFICATIONS //
    ///////////////////

    /**
     * Show a Growl-like notification message. A notification can have a title and a message, and will also have
     * a close button for closing the notification. Notifications can be used as a confirmation message, error message, etc.
     *
     * This function is mostly just a wrapper around jQuery.bootstrap.notify.js and supports all of the options documented
     * at https://github.com/goodybag/bootstrap-notify.
     *
     * @param  {String}    [title]    The notification title
     * @param  {String}    message    The notification message that will be shown underneath the title
     * @param  {String}    [type]     The notification type. The supported types are `success`, `error` and `info`, as defined in http://getbootstrap.com/components/#alerts. By default, the `success` type will be used
     * @param  {String}    [id]       Unique identifier for the notification, in case a notification can be triggered twice due to some reason. If a second notification with the same id is triggered it will be ignored
     * @throws {Error}                Error thrown when no message has been provided
     * @return {Boolean}              Returns true when the notification has been shown
     */
    var notification = exports.notification = function(title, message, type, id) {
        if (!message) {
            throw new Error('A valid notification message should be provided');
        }

        if (id && $('#' + id).length) {
            return false;
        }

        // Check if the notifications container has already been created.
        // If the container has not been created yet, we create it and add
        // it to the DOM.
        var $notificationContainer = $('#gh-notification-container');
        if ($notificationContainer.length === 0) {
            $notificationContainer = $('<div>').attr('id', 'gh-notification-container').addClass('notifications top-center');
            $('body').append($notificationContainer);
        }

        // If a title has been provided, we wrap it in an h4 and prepend it to the message
        if (title) {
            message = '<h4 id="' + id + '">' + title + '</h4>' + message;
        }

        // Show the actual notification
        $notificationContainer.notify({
            'fadeOut': {
                'enabled': true,
                'delay': 5000
            },
            'type': type,
            'message': {'html': message},
            'transition': 'fade'
        }).show();

        return true;
    };


    ///////////////
    // REDIRECTS //
    ///////////////

    /**
     * All functionality related to redirecting users to error pages, etc.
     */
    /* istanbul ignore next */
    var redirect = exports.redirect = function() {

        /**
         * Redirect the current user to the 404 page. This can be used when the user requests a page or entity
         * that cannot be found.
         */
        var notfound = function() {
            window.location = '/notfound';
        };

        /**
         * Redirect the current user to the 503 page. This can be used when the user requests a page on a tenant
         * that is currently not available
         */
        var unavailable = function() {
            window.location = '/unavailable';
        };

        return {
            'notfound': notfound,
            'unavailable': unavailable
        };
    };


    /////////////////
    //  TEMPLATES  //
    /////////////////

    /**
     * Add support for partials in Lodash. `_.mixin` allows us to extend underscore with
     * custom functions that are available in every template. By running
     * `_.partial('name', data, renderAtStart)` in a template the partial can be accessed.
     * The name corresponds to the name given when declaring the partial. The data should be an
     * object containing values used in the partial. `renderAtStart` should be set to false if
     * the partial is called from inside another partial and should be rendered via a
     * JavaScript call after the wrapping partial has been rendered.
     *
     * @param  {Function}    callback    Standard callback function
     */
    var cachePartials = exports.cachePartials = function(callback) {
        // Used to cache the partials
        var partialCache = {};

        // Add our own functions to lodash to declare and access partials
        _.mixin({
            'declarePartial': function(name, template) {
                partialCache[name] = _.template(template);
            },
            'partial': function(name, data, renderAtStart) {
                // TODO: replace `renderStart` with a more robust solution for delayed rendering
                //       of partials inside of partials
                /* istanbul ignore if */
                if (renderAtStart === false) {
                    return '<%= _.partial("' + name + '", {data: data}, null) %>';
                }
                return partialCache[name](data);
            }
        });

        // Require all the partial HTML files
        require(['text!gh/partials/admin-batch-edit.html',
                 'text!gh/partials/admin-batch-edit-date.html',
                 'text!gh/partials/admin-edit-date-field.html',
                 'text!gh/partials/admin-batch-edit-event-row.html',
                 'text!gh/partials/admin-batch-edit-event-type.html',
                 'text!gh/partials/admin-borrow-series-module-item.html',
                 'text!gh/partials/admin-edit-dates.html',
                 'text!gh/partials/admin-module-item.html',
                 'text!gh/partials/admin-modules.html',
                 'text!gh/partials/borrow-series-modal.html',
                 'text!gh/partials/calendar.html',
                 'text!gh/partials/editable-parts.html',
                 'text!gh/partials/event.html',
                 'text!gh/partials/event-popover.html',
                 'text!gh/partials/login-form.html',
                 'text!gh/partials/login-modal.html',
                 'text!gh/partials/new-module-modal.html',
                 'text!gh/partials/new-series.html',
                 'text!gh/partials/student-module-item.html',
                 'text!gh/partials/student-modules.html',
                 'text!gh/partials/subheader-part.html',
                 'text!gh/partials/subheader-picker.html',
                 'text!gh/partials/subheader-pickers.html',
                 'text!gh/partials/visibility-modal.html'], function(adminBatchEdit, adminBatchEditDate, adminEditDateField, adminBatchEditEventRow, adminBatchEditEventType, adminBorrowSeriesModuleItem, adminEditDates, adminModuleItem, adminModules, borrowSeriesModal, calendar, editableParts, eventItem, eventPopover, loginForm, loginModal, newModuleModal, newSeries, studentModuleItem, studentModules, subheaderPart, subheaderPicker, subheaderPickers, visibilityModal) {

            // Declare all partials which makes them available in every template
            _.declarePartial('admin-batch-edit', adminBatchEdit);
            _.declarePartial('admin-batch-edit-date', adminBatchEditDate);
            _.declarePartial('admin-edit-date-field', adminEditDateField);
            _.declarePartial('admin-batch-edit-event-type', adminBatchEditEventType);
            _.declarePartial('admin-batch-edit-event-row', adminBatchEditEventRow);
            _.declarePartial('admin-borrow-series-module-item', adminBorrowSeriesModuleItem);
            _.declarePartial('admin-edit-dates', adminEditDates);
            _.declarePartial('admin-module-item', adminModuleItem);
            _.declarePartial('admin-modules', adminModules);
            _.declarePartial('borrow-series-modal', borrowSeriesModal);
            _.declarePartial('calendar', calendar);
            _.declarePartial('editable-parts', editableParts);
            _.declarePartial('event', eventItem);
            _.declarePartial('event-popover', eventPopover);
            _.declarePartial('login-form', loginForm);
            _.declarePartial('login-modal', loginModal);
            _.declarePartial('new-module-modal', newModuleModal);
            _.declarePartial('new-series', newSeries);
            _.declarePartial('student-modules', studentModules);
            _.declarePartial('student-module-item', studentModuleItem);
            _.declarePartial('subheader-part', subheaderPart);
            _.declarePartial('subheader-picker', subheaderPicker);
            _.declarePartial('subheader-pickers', subheaderPickers);
            _.declarePartial('visibility-modal', visibilityModal);

            callback();
        });
    };

    /**
     * Render a template and either return the HTML or populate a target container with the result
     *
     * @param  {Element|String}    $template    jQuery element representing the HTML element that contains the template or jQuery selector for the template container
     * @param  {Object}            [data]       JSON object representing the values used to process the template
     * @param  {Element|String}    [$target]    jQuery element representing the HTML element in which the template output should be put, or jQuery selector for the output container
     * @return {String}                         The rendered HTML
     * @throws {Error}                          Error thrown when no template has been provided
     */
    var renderTemplate = exports.renderTemplate = function($template, data, $target) {
        if (!$template) {
            throw new Error('No valid template has been provided');
        }

        // Make sure we're dealing with jQuery objects
        $template = $($template);
        $target = $($target);

        data = data || {};

        // Compile the template
        var compiled = _.template($template.text());
        compiled = compiled(data);

        // If a target container was specified, render the HTML into it
        if ($target.length) {
            $target.html(compiled);
        }

        // Always return the rendered HTML string
        return compiled;
    };


    ////////////////
    //  TRIPOSES  //
    ////////////////

    /**
     * Return the tripos structure
     *
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The tripos structure
     */
    /* istanbul ignore next */
    var getTriposStructure = exports.getTriposStructure = function(callback) {
        if (!_.isFunction(callback)) {
            throw new Error('An invalid value for callback was provided');
        }

        var core = require('gh.core');
        var appId = core.data.me && core.data.me.AppId ? core.data.me.AppId : null;
        require('gh.api.orgunit').getOrgUnits(null, false, true, null, ['course', 'subject', 'part'], function(err, data) {
            if (err) {
                return callback(err);
            }

            var triposData = {
                'courses': [],
                'subjects': [],
                'parts': [],
                'modules': []
            };

            triposData.courses = _.filter(data.results, function(course) {
                return course.type === 'course';
            });

            triposData.subjects = _.filter(data.results, function(subject) {
                return subject.type === 'subject';
            });

            triposData.parts = _.filter(data.results, function(part) {
                return part.type === 'part';
            });

            // Sort the data before displaying it
            triposData.courses.sort(sortByDisplayName);
            triposData.subjects.sort(sortByDisplayName);
            triposData.parts.sort(sortByDisplayName);

            return callback(null, triposData);
        });
    };

    // Initialise Google Analytics
    googleAnalytics();
});
