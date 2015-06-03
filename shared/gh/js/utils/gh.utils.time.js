/*!
 * Copyright 2015 Digital Services, University of Cambridge Licensed
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

define(['exports', 'gh.constants', 'moment', 'moment-timezone'], function(exports, constants, moment, tz) {

    /**
     * Add a leading zero to a digit
     *
     * @param  {Number}    digit    The digit that needs to be extended with an extra zero, if necessary
     * @return {Number}             The extended digit
     * @throws {Error}              A parameter validation error
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
     * @throws {Error}             A parameter validation error
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
     * @throws {Error}             A parameter validation error
     */
    var convertUnixDatetoISODate = exports.convertUnixDatetoISODate = function(date) {
        if (!date || !moment(date, 'x').isValid()) {
            throw new Error('An invalid value for date has been provided');
        }
        return moment.utc(date).format();
    };

    /**
     * @param  {String}    startDate    The start date of the event in UTC format (e.g. 2014-10-07T08:00:00.000Z)
     * @param  {String}    endDate      The end date of the event in UTC format (e.g. 2014-10-07T11:00:00.000Z)
     * @return {String}                 The converted date in display format (e.g. 'W7 • Fri 2–3pm')
     * @throws {Error}                  A parameter validation error
     */
    var generateDisplayDate = exports.generateDisplayDate = function(startDate, endDate) {
        if (!_.isString(startDate) || !moment(startDate, 'YYYY-MM-DD').isValid()) {
            throw new Error('A valid start date should be provided');
        } else if (!_.isString(endDate) || !moment(endDate, 'YYYY-MM-DD').isValid()) {
            throw new Error('A valid end date should be provided');
        }

        var weekNumber = 'OT';
        if (getTerm(convertISODatetoUnixDate(moment.tz(endDate, 'Europe/London').format('YYYY-MM-DD')))) {
            weekNumber = getAcademicWeekNumber(convertISODatetoUnixDate(moment.tz(endDate, 'Europe/London').format('YYYY-MM-DD')));
            /* istanbul ignore else */
            if (weekNumber) {
                weekNumber = 'W' + weekNumber;
            }
        }

        // Retrieve the day
        var weekDay = moment.tz(endDate, 'Europe/London').format('E');
        weekDay = constants.time.DAYS[weekDay - 1];

        // Retrieve the meridien values
        var startMeridien = moment.tz(startDate, 'Europe/London').format('a');
        var endMeridien = moment.tz(endDate, 'Europe/London').format('a');

        // Compose the start part
        var startParts = [];
        startParts.push(moment.tz(startDate, 'Europe/London').format('h'));
        var startMinutes = moment.tz(startDate, 'Europe/London').format('mm');
        if (parseInt(startMinutes, 10)) {
            startParts.push(':' + startMinutes);
        }
        if (startMeridien !== endMeridien) {
            startParts.push(startMeridien);
        }
        startParts = startParts.join('');

        // Compose the end part
        var endParts = [];
        endParts.push(moment.tz(endDate, 'Europe/London').format('h'));
        var endMinutes = moment.tz(endDate, 'Europe/London').format('mm');
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
     *  * To determine which week we're currently in, we subtract the offset from the number of weeks.
     *  * We need to add one week, since we're doing a zero-based numbering.
     *  *
     *  *   week = (weeks - offset) + 1
     *
     * @param  {Number}     date          The date where the academic week number needs to be returned for
     * @return {Number}                   The academic week number
     * @throws {Error}                    A parameter validation error
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

        // Get the start date of the first week and add 2 days, since
        // academic weeks always start 2 days after the beginning of term.
        var weekStartDate = convertISODatetoUnixDate(moment.tz(currentTerm.start, 'Europe/London').add({'days': 2, 'hours': 1}).format('YYYY-MM-DD'));

        // Calculate and return the current academic week number
        // If the term in which the date is can be retrieved, we need to calculate the exact
        // week in that term. If it can't be retrieved the date is out of term and 0 should
        // be returned
        var weekNumber = 0;

        // Fix the summer time issue
        date = moment.tz(date, 'Europe/London');

        // Calculate the week number if it's within an academic term
        /* istanbul ignore else */
        if (currentTerm) {
            weekNumber = Math.floor(((date - weekStartDate) / constants.time.PERIODS['week'])) + 1;
        }

        // Return the week number
        return weekNumber;
    };

    /**
     * Return the current term if the current date is within a term
     *
     * @param  {Number}     date          The date in a UNIX time format
     * @return {Object}                   The term that has the specified date in its range
     * @throws {Error}                    A parameter validation error
     */
    var getTerm = exports.getTerm = function(date) {
        if (!_.isNumber(date)) {
            throw new Error('A valid date should be provided');
        }

        // Get the configuration
        var config = require('gh.core').config;
        // Get the correct terms associated to the current application
        var terms = config.terms[config.academicYear];

        // Get the current term and return its name
        return _.find(terms, function(term) {

            // Convert the dates from ISO to UNIX for easier calculation
            var startDate = convertISODatetoUnixDate(moment.tz(term.start, 'Europe/London').add({'days': 2}).toISOString());
            var endDate = convertISODatetoUnixDate(moment.tz(term.end, 'Europe/London').subtract({'days': 2}).toISOString());

            // Return the term where the specified date is within the range
            if (isDateInRange(date, startDate, endDate)) {
                return term;
            }
        });
    };

    /**
     * Get the date of the first lecture day of the specified term
     *
     * @param  {String}    termName    The name of the term to get the date of the first day for
     * @return {String                 The date of the first lecture day of the term in ISO format (e.g. 2015-01-15T01:00:00.000Z)
     * @throws {Error}                 A parameter validation error
     */
    var getFirstLectureDayOfTerm = exports.getFirstLectureDayOfTerm = function(termName) {
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

        // Return the date of the first lecture day
        return moment(term.start).add({'days': 2, 'hours': -((new Date()).getTimezoneOffset() / 60)}).toISOString();
    };

    /**
     * Get the number of weeks in a term
     *
     * @param  {Object}    term    The term to get the number of weeks for
     * @return {Number}            The number of weeks in the term
     * @throws {Error}             A parameter validation error
     */
    var getWeeksInTerm = exports.getWeeksInTerm = function(term) {
        if (!_.isObject(term)) {
            throw new Error('A valid term should be provided');
        }

        // Convert the term start and end date to milliseconds
        var termStartDate = moment(term.start).add({'days': 2});
        var termEndDate = moment(term.end).subtract({'days': 2});

        // Calculate the time difference
        var timeDifference = Math.abs(termEndDate - termStartDate);

        // Convert to weeks and return
        return Math.ceil(timeDifference / constants.time.PERIODS['week']);
    };

    /**
     * Get a date by specifying the term it's in, the week number it's in and the day of the week it is
     *
     * @param  {String}    termName      The name of the term to look for the date
     * @param  {Number}    weekNumber    The week of the term to look for the date
     * @param  {Number}    dayNumber     The day of the week to look for the dae
     * @return {Date}                    Date object of the day in the term
     * @throws {Error}                   A parameter validation error
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
                var weekOffset = (weekNumber - 1) * constants.time.PERIODS['week'];
                // Calculate the start date of the week
                var startOfWeekDate = new Date(termStartDate + weekOffset);
                // Find out what day this day is
                var startOfWeekDay = startOfWeekDate.getDay();

                // If the dayNumber is smaller than the day the week starts on,
                // add a week to the weekOffset and substract the difference in days
                if (dayNumber < startOfWeekDay) {
                    startOfWeekDate = startOfWeekDate.getTime() + constants.time.PERIODS['week'];
                    // Remove x days from the week to get to the final date to return
                    dateByWeekAndDay = startOfWeekDate - ((startOfWeekDay - dayNumber) * constants.time.PERIODS['day']);

                // If the dayNumber is larger than the day, just add the difference
                } else {
                    // Add x days to the week to get to the final date to return
                    dateByWeekAndDay = startOfWeekDate.getTime() + ((dayNumber - startOfWeekDay) * constants.time.PERIODS['day']);
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
         * Returns the first 3 letters of the day's name from a UTC string
         *
         * @return {Number}
         * @throws {Error}     A parameter validation error
         */
        var dayName = function() {
            if (!_.isString(date) || !moment(date, 'YYYY-MM-DD').isValid()) {
                throw new Error('A valid date should be provided');
            }
            return moment.tz(date, 'Europe/London').format('ddd');
        };

        /**
         * Returns the day from a UTC string
         *
         * @return {Number}
         * @throws {Error}     A parameter validation error
         */
        var dayNumber = function() {
            if (!_.isString(date) || !moment(date, 'YYYY-MM-DD').isValid()) {
                throw new Error('A valid date should be provided');
            }
            return parseInt(moment.tz(date, 'Europe/London').format('D'), 10);
        };

        /**
         * Returns the month from a UTC tring
         *
         * @return {String}
         * @throws {Error}     A parameter validation error
         */
        var monthName = function() {
            if (!_.isString(date) || !moment(date, 'YYYY-MM-DD').isValid()) {
                throw new Error('A valid date should be provided');
            }
            return constants.time.MONTHS[moment.tz(date, 'Europe/London').format('M') - 1];
        };

        return {
            'dayName': dayName,
            'dayNumber': dayNumber,
            'monthName': monthName
        };
    };

    /**
     * Convert a date to GMT/BST for display in the calendar
     *
     * @param  {String}    date    The date that needs conversion
     */
    var fixDateToGMT = exports.fixDateToGMT = function(date) {
        if (!_.isString(date) || !moment(date, 'YYYY-MM-DD').isValid()) {
            throw new Error('A valid date should be provided');
        }

        return moment.tz(date, 'Europe/London');
    };

    /**
     * Convert start and end times of an event to GMT+0 for display in the calendar
     *
     * @param  {Object[]}    events    An Array of events to fix start and end date to GTM+0 for
     * @throws {Error}                 A parameter validation error
     */
    var fixDatesToGMT = exports.fixDatesToGMT = function(events) {
        if (!_.isArray(events)) {
            throw new Error('A valid array should be provided');
        }
        _.each(events, function(ev) {
            ev.start = moment.tz(ev.start, 'Europe/London');
            ev.end = moment.tz(ev.end, 'Europe/London');
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
                range.start = convertUnixDatetoISODate(moment(currentViewDate).subtract(constants.time.PERIODS[currentView], 'milliseconds'));

                // Calculate the end date
                range.end = convertUnixDatetoISODate(moment(currentViewDate).add(constants.time.PERIODS[currentView], 'milliseconds'));

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
     * @throws {Error}                  A parameter validation error
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
     * @throws {Error}                  A parameter validation error
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
     * @throws {Error}              A parameter validation error
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
                    'start': moment.tz(term.start, 'Europe/London').toISOString(),
                    'end': moment.tz(term.end, 'Europe/London').toISOString(),
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
                    'start': moment.tz(event.start, 'Europe/London').toISOString(),
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
     * @throws {Error}                A parameter validation error
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
                var eventStartDay = convertISODatetoUnixDate(moment.tz(evStart, 'Europe/London').format('YYYY-MM-DD'));
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
});
