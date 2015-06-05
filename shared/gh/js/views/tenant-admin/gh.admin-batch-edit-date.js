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

define(['gh.core', 'gh.api.config', 'lodash', 'moment', 'moment-timezone'], function(gh, configAPI, _, moment, tz) {


    ///////////////
    // RENDERING //
    ///////////////

    /**
     * Render the batch edit date container
     *
     * @param  {Number}      maxNumberOfWeeks    The maximum number of weeks in a term associated to the app
     * @param  {Object[]}    weeksInUse          Array containing the numbers of the weeks that are selected
     * @param  {Object[]}    termsInUse          The terms of the events that were selected
     * @param  {Object}      daysInUse           Object describing the days in use by the selection and their start and end times
     * @private
     */
    var renderBatchDate = function(maxNumberOfWeeks, weeksInUse, termsInUse, daysInUse) {
        gh.utils.renderTemplate('admin-batch-edit-date', {
            'data': {
                'gh': require('gh.core'),
                'numberOfWeeks': maxNumberOfWeeks,
                'weeksInUse': weeksInUse,
                'termsInUse': termsInUse,
                'daysInUse': daysInUse
            }
        }, $('#gh-batch-edit-date-container'));
    };

    /**
     * Build the data object required to render the date batch edit template
     *
     * @private
     */
    var buildBatchDateObject = function() {
        // Get the checked events from the batch edit container
        var $selectedRows = $('.gh-batch-edit-events-container tr.info:visible:not(".gh-event-deleted")');
        // Filter the rows that are eligible for updating
        var $rows = getEligibleRows($selectedRows);
        // Get the checked terms from the batch edit container
        var $terms = $('.gh-batch-edit-events-container thead .gh-select-all:checked');
        // Get the maximum number of weeks in a term
        var maxNumberOfWeeks = getMaxNumberOfWeeks();
        // Get the weeks that are in use by the selection
        var weeksInUse = getWeeksInUse($rows);
        // Get the term data for the selection
        var termsInUse = getTermsInUse($rows);
        // Get the unique days in the week to render time pickers for
        var daysInUse = getDaysInUse($rows);
        // Render the batch date editor if at least one week was selected that isn't out of term
        if (termsInUse.length) {
            renderBatchDate(maxNumberOfWeeks, weeksInUse, termsInUse, daysInUse);
        }
    };


    ///////////////
    // UTILITIES //
    ///////////////

    /**
     * Show a progress indicator when heavy lifting is going on in the app
     *
     * @param  {Number}    current    The number of the event that's currently being handled
     * @param  {Number}    total      The total number of events that need to be handled
     * @private
     */
    var updateEventManipulationProgress = function(current, total) {
        if (current !== total) {
            $('.gh-batch-edit-date-processing').show();
            $('button, input, select', $('#gh-batch-edit-date-container')).attr('disabled', 'disabled');
        } else {
            $('.gh-batch-edit-date-processing').hide();
            $('button, input, select', $('#gh-batch-edit-date-container')).removeAttr('disabled', 'disabled');
        }

        // Show the user a completion percentage
        $('.gh-batch-edit-date-processing-total').text(Math.ceil(((current / total) * 100)) + '%');
    };

    /**
     * Filter the rows that are eligible for batch date/time updating
     *
     * @param  {Object[]}    $rows    A collection of selected rows
     * @return {Object[]}             A filtered collection of rows that are eligible for updating
     * @private
     */
    var getEligibleRows = function($rows) {
        return _.filter($rows, function($row) {
            if (!$($row).closest('.gh-batch-edit-events-container').hasClass('gh-ot')) {
                return $row;
            }
        });
    };

    /**
     * Remove events from a specified week number
     *
     * @param  {Number}    weekNumber    The week number to delete events from
     * @private
     */
    var removeEventsInWeek = function(weekNumber) {
        // Get the checked events from the batch edit container
        var $selectedRows = $('.gh-batch-edit-events-container tr.info:visible');
        // Filter the rows that are eligible for updating
        var $rows = getEligibleRows($selectedRows);
        // Mark the rows that are not eligible for updating
        $(_.difference($selectedRows, $rows)).addClass('gh-not-eligible');
        // Keep track of progress
        var totalEvents = $rows.length;
        var currentEvent = 0;
        // For each row, check if the event is taking place in the week that is to be removed
        _.each($rows, function($row) {
            _.defer(function() {
                $row = $($row);
                // Get the start date of the event
                var startDate = gh.utils.convertISODatetoUnixDate($row.find('.gh-event-date').attr('data-start'));
                // Get the week in which the event takes place
                var dateWeek = gh.utils.getAcademicWeekNumber(startDate);
                // If the event takes place in the week that needs to be removed, delete it
                if (dateWeek === weekNumber) {
                    $row.addClass('gh-event-deleted').find('.gh-event-delete button').click();
                }

                // Update processing progress indication
                currentEvent = currentEvent + 1;
                updateEventManipulationProgress(currentEvent, totalEvents);
            });
        });
    };

    /**
     * Generates other days after the 'add another day' button was clicked and a day of the week was chosen
     *
     * @private
     */
    var generateOtherDays = function() {
        // Default the container to look for selected weeks in
        var $weeks = $('#gh-batch-edit-date-picker input:checked');
        // Get the days in use by the batch date pickers
        var $days = $('.gh-batch-edit-time-picker');
        // Get the selected day
        var dayOfTheWeek = parseInt($(this).val(), 10);

        // Keep track of progress
        var totalEvents = $('#gh-batch-edit-date-picker-container').data('terms').split(',').length * $weeks.length;
        var currentEvent = 0;

        // For each selected term, add another day
        _.each($('#gh-batch-edit-date-picker-container').data('terms').split(','), function(termName) {
            // Generate default values based on what was previously added
            var defaultLocation = $($('.gh-event-location:not(:empty)')[0]).text();
            var $hiddenOrganiserFields = $($('.gh-event-organisers:not(:empty)')[0]).prev();
            var defaultOrganisers = gh.utils.getOrganiserObjects($hiddenOrganiserFields);
            // For each selected week, add another day
            _.each($weeks, function(chk) {
                _.defer(function() {

                    // Get the week number
                    var eventWeek = parseInt(chk.value, 10);
                    // Get the date of the event
                    // var dateByWeekAndDay = gh.utils.getDateByWeekAndDay(termName, eventWeek, dayOfTheWeek);

                    // Get the date by week and day
                    // Since Cambridge weeks start on Thursdays, we should prevent that
                    // chosen days are put before the current selected day. Therefore
                    // we need to add one week for all the days except Tuesdays and Wednesdays.
                    // (We have a 2 day offset, since terms start on Tuesdays, sigh).
                    var dateByWeekAndDay = gh.utils.getDateByWeekAndDay(termName, eventWeek, dayOfTheWeek);
                    if (_.contains([2,3], dayOfTheWeek)) {
                        dateByWeekAndDay = moment(dateByWeekAndDay).add({'weeks': 1});
                    }

                    // Only add a new event for the generated day if the day is within a term
                    var inTerm = gh.utils.getTerm(gh.utils.convertISODatetoUnixDate(moment.tz(dateByWeekAndDay, 'Europe/London').format()));
                    if (inTerm) {

                        var eventYear = moment.tz(dateByWeekAndDay, 'Europe/London').format('YYYY');
                        // We need to subtract a month here, since creating a moment date object uses a zero-based calculation for months
                        var eventMonth = parseInt(moment.tz(dateByWeekAndDay, 'Europe/London').format('MM'), 10) - 1;
                        // We're adding one hour here to fix the summer- and wintertime issue
                        var eventDay = moment.tz(dateByWeekAndDay, 'Europe/London').add({'hours': 1}).format('DD');

                        var eventStartHour = 13;
                        var eventStartMinute = 0;
                        var eventEndHour = 14;
                        var eventEndMinute = 0;

                        // Create the start date of the event
                        var startDate = moment.tz([eventYear, eventMonth, eventDay, eventStartHour, eventStartMinute, 0, 0], 'Europe/London');
                        // Create the end date of the event
                        var endDate = moment.tz([eventYear, eventMonth, eventDay, eventEndHour, eventEndMinute, 0, 0], 'Europe/London');

                        // Send off an event that will be picked up by the batch edit and add the rows to the terms
                        var alreadyAdded = $('.gh-event-date[data-start="' + moment.tz(startDate, 'Europe/London').format() + '"]').length;
                        if (!alreadyAdded) {
                            $(document).trigger('gh.batchedit.addevent', {
                                'eventContainer': $('.gh-batch-edit-events-container[data-term="' + termName + '"]').find('tbody'),
                                'eventObj': {
                                    'tempId': gh.utils.generateRandomString(), // The actual ID hasn't been generated yet
                                    'isNew': true, // Used in the template to know this one needs special handling
                                    'selected': true,
                                    'displayName': $('.gh-jeditable-series-title').text(),
                                    'end': moment.tz(endDate, 'Europe/London').format(),
                                    'location': defaultLocation,
                                    'type': gh.config.events.default,
                                    'organisers': defaultOrganisers,
                                    'start': moment.tz(startDate, 'Europe/London').format()
                                },
                                'startDate': startDate
                            });

                            // Update processing progress indication
                            currentEvent = currentEvent + 1;
                            updateEventManipulationProgress(currentEvent, totalEvents);
                        }
                    }
                });
            });
        });

        // Track a user adding another day
        gh.utils.trackEvent(['Data', 'Batch edit', 'TimeDate', 'Added another day']);
    };

    /**
     * Add another day selector to the terms. The actual events will only be created if the default `Choose a day`
     * changes into a day selection
     *
     * @private
     */
    var addAnotherDay = function() {
        // Render a day picker with default values
        gh.utils.renderTemplate('admin-batch-edit-time-picker', {
            'data': {
                'gh': gh,
                'dayInUse': {
                    'startHour': 13,
                    'endHour': 14,
                    'startMinute': 0,
                    'endMinute': 0
                },
                'daysInUse': getDaysInUse($('.gh-batch-edit-events-container tr.info:visible:not(".gh-event-deleted")')),
                'dayIndex': 7
            }
        }, null, function(template) {
            // Append the HTML as the last day in the list
            $('#gh-batch-edit-day-picker-container .gh-batch-edit-time-picker').last().after(template);
        });
    };

    /**
     * Add another event to the terms based on the selection of weeks. If the event has already been added it won't be
     * added again unless `forceAdd` has been set to `true`
     *
     * @param {Boolean}    [forceAdd]    Whether to force adding another day. Defaults to `false`
     * @private
     */
    var addAnotherEvent = function(forceAdd) {
        // Default the container to look for selected weeks in
        var $weeks = $('#gh-batch-edit-date-picker input:checked');
        var $days = $('.gh-batch-edit-time-picker');

        // Keep track of progress
        var totalEvents = $('#gh-batch-edit-date-picker-container').data('terms').split(',').length * $weeks.length * $days.length;
        var currentEvent = 0;

        // For each term selected, add events
        _.each($('#gh-batch-edit-date-picker-container').data('terms').split(','), function(termName) {
            // Generate default values based on what was previously added
            var defaultLocation = $($('.gh-event-location:not(:empty)')[0]).text();
            var $hiddenOrganiserFields = $($('.gh-event-organisers:not(:empty)')[0]).prev();
            var defaultOrganisers = gh.utils.getOrganiserObjects($hiddenOrganiserFields);

            // For each selected week, add events
            _.each($weeks, function(chk) {

                // Add an event for each selected day
                if ($days.length) {
                    _.each($days, function($timePickerContainer) {
                        _.defer(function() {
                            // Get the week number
                            var eventWeek = parseInt(chk.value, 10);
                            // Get the day number
                            var eventDay = parseInt($('.gh-batch-edit-day-picker', $timePickerContainer).val(), 10);
                            // Get the date by week and day
                            // Since Cambridge weeks start on Thursdays, we should prevent that
                            // chosen days are put before the current selected day. Therefore
                            // we need to add one week for all the days except Tuesdays and Wednesdays.
                            // (We have a 2 day offset, since terms start on Tuesdays, sigh).
                            var dateByWeekAndDay = gh.utils.getDateByWeekAndDay(termName, eventWeek, eventDay);
                            if (_.contains([2,3], eventDay)) {
                                dateByWeekAndDay = moment.tz(dateByWeekAndDay, 'Europe/London').add({'weeks': 1});
                            }
                            // Retrieve the year of the event
                            var eventYear = moment.tz(dateByWeekAndDay, 'Europe/London').format('YYYY');
                            // We need to subtract a month here, since creating a moment date object uses a zero-based calculation for months
                            var eventMonth = parseInt(moment.tz(dateByWeekAndDay, 'Europe/London').format('MM'), 10) - 1;
                            // We're adding one hour here to fix the summer- and wintertime issue
                            eventDay = moment.tz(dateByWeekAndDay, 'Europe/London').add({'hours': 1}).format('DD');

                            var eventStartHour = parseInt($('.gh-batch-edit-hours-start', $timePickerContainer).val(), 10);
                            var eventStartMinute = parseInt($('.gh-batch-edit-minutes-start', $timePickerContainer).val(), 10);
                            var eventEndHour = parseInt($('.gh-batch-edit-hours-end', $timePickerContainer).val(), 10);
                            var eventEndMinute = parseInt($('.gh-batch-edit-minutes-end', $timePickerContainer).val(), 10);

                            // Create the start date of the event
                            var startDate = moment.tz([eventYear, eventMonth, eventDay, eventStartHour, eventStartMinute, 0, 0], 'Europe/London');
                            // Create the end date of the event
                            var endDate = moment.tz([eventYear, eventMonth, eventDay, eventEndHour, eventEndMinute, 0, 0], 'Europe/London');

                            // Send off an event that will be picked up by the batch edit and add the rows to the terms
                            var alreadyAdded = $('.gh-event-date[data-start="' + moment.tz(startDate, 'Europe/London').format() + '"]').length;
                            if (!alreadyAdded || forceAdd) {
                                $(document).trigger('gh.batchedit.addevent', {
                                    'eventContainer': $('.gh-batch-edit-events-container[data-term="' + termName + '"]').find('tbody'),
                                    'eventObj': {
                                        'tempId': gh.utils.generateRandomString(), // The actual ID hasn't been generated yet
                                        'isNew': true, // Used in the template to know this one needs special handling
                                        'selected': true,
                                        'displayName': $('.gh-jeditable-series-title').text(),
                                        'end': moment.tz(endDate, 'Europe/London').format(),
                                        'location': defaultLocation,
                                        'type': gh.config.events.default,
                                        'organisers': defaultOrganisers,
                                        'start': moment.tz(startDate, 'Europe/London').format()
                                    },
                                    'startDate': startDate
                                });
                            }

                            // Update processing progress indication
                            currentEvent = currentEvent + 1;
                            updateEventManipulationProgress(currentEvent, totalEvents);
                        });
                    });

                // Create a default event when no days were selected
                } else {
                    _.defer(function() {
                        // Get the week number
                        var eventWeek = parseInt(chk.value, 10);

                        // Determine the day number, based on the academic week number
                        var eventDay = parseInt(moment.tz(new Date(), 'Europe/London').format('E'), 10);

                        // Get the date by week and day
                        var dateByWeekAndDay = gh.utils.getDateByWeekAndDay(termName, eventWeek, eventDay);

                        // Since Cambridge weeks start on Thursdays, we should prevent that
                        // chosen days are put before the current selected day. Therefore
                        // we need to add one week for the Tuesdays and Wednesdays
                        // (We have a 2 day offset, since terms start on Tuesdays, sigh).
                        if (_.contains([2,3], eventDay)) {
                            dateByWeekAndDay = moment.tz(dateByWeekAndDay, 'Europe/London').add({'weeks': 1});
                        }

                        // Create the start date of the event
                        var startDate = moment.tz(dateByWeekAndDay, 'Europe/London').hour(13);
                        // Create the end date of the event
                        var endDate = moment.tz(dateByWeekAndDay, 'Europe/London').hour(14);

                        // Send off an event that will be picked up by the batch edit and add the rows to the terms
                        $(document).trigger('gh.batchedit.addevent', {
                            'eventContainer': $('.gh-batch-edit-events-container[data-term="' + termName + '"]').find('tbody'),
                            'eventObj': {
                                'tempId': gh.utils.generateRandomString(), // The actual ID hasn't been generated yet
                                'isNew': true, // Used in the template to know this one needs special handling
                                'selected': true,
                                'displayName': $('.gh-jeditable-series-title').text(),
                                'end': moment.tz(endDate, 'Europe/London').format(),
                                'location': defaultLocation,
                                'type': gh.config.events.default,
                                'organisers': defaultOrganisers,
                                'start': moment.tz(startDate, 'Europe/London').format()
                            },
                            'startDate': startDate
                        });

                        // Update processing progress indication
                        currentEvent = currentEvent + 1;
                        updateEventManipulationProgress(currentEvent, totalEvents);
                    });
                }
            });
        });
    };

    /**
     * Get the days in use by the selection
     *
     * @param  {Object[]}    $rows    Array of rows that are selected for batch edit
     * @param  {Object}               Object describing the days in use by the selection and their start and end times
     * @private
     */
    var getDaysInUse = function($rows) {
        var daysObj = {};
        _.each($rows, function($row) {
            $row = $($row);
            var startDate = moment.tz($row.find('.gh-event-date').attr('data-start'), 'Europe/London');
            var endDate = moment.tz($row.find('.gh-event-date').attr('data-end'), 'Europe/London');
            var dayOfTheWeek = new Date(startDate).getDay();
            daysObj[dayOfTheWeek] = {
                'startHour': parseInt(moment(startDate).format('H'), 10),
                'endHour': parseInt(moment(endDate).format('H'), 10),
                'startMinute': parseInt(moment(startDate).format('m'), 10),
                'endMinute': parseInt(moment(endDate).format('m'), 10)
            };
        });

        return daysObj;
    };

    /**
     * Get the terms that are in use by the checked event rows
     *
     * @param  {Object[]}    $rows    Array of rows that are selected for batch edit
     * @return {Object[]}             Array of terms used by the checked event rows
     * @private
     */
    var getTermsInUse = function($rows) {
        var appTerms = configAPI.getAppTerm();
        var termsInUse = [];
        _.each(appTerms, function(term) {
            _.each($rows, function(row) {
                var termStart = new Date(term.start);
                var termEnd = new Date(term.end);
                var eventStart = new Date($(row).find('.gh-event-date').attr('data-start'));

                if (eventStart > termStart && eventStart < termEnd) {
                    termsInUse.push(term);
                }
            });

            // If the `select all` checkbox is checked, include this term
            if ($('.gh-batch-edit-events-container[data-term="' + term.name + '"] .gh-select-all').is(':checked')) {
                termsInUse.push(term);
            }
        });

        return _.uniq(termsInUse);
    };

    /**
     * Get the week numbers that are in use by the checked event rows
     *
     * @param  {Object[]}    $rows    Array of rows that are selected for batch edit
     * @return {Number[]}             Array week numbers that are in use by the checked event rows
     * @private
     */
    var getWeeksInUse = function($rows) {
        // Keep track of the weeks in use
        var weeksInUse = [];
        // Extract the weeks from the batch
        _.each($rows, function(row) {
            var start = gh.utils.convertISODatetoUnixDate(moment.tz($(row).find('.gh-event-date').attr('data-start'), 'Europe/London').format('YYYY-MM-DD'));
            weeksInUse.push(gh.utils.getAcademicWeekNumber(start));
        });
        return _.uniq(weeksInUse);
    };

    /**
     * Get the maximum number of weeks in an academic year term and return it
     *
     * @return {Object}    The maximum number of weeks in an academic year term
     * @private
     */
    var getMaxNumberOfWeeks = function() {
        // Get the configuration
        var config = require('gh.core').config;
        // Get the correct terms associated to the current application
        var terms = config.terms[config.academicYear];
        // Cache the max weeks in a term
        var maxWeeks = 0;
        // Loop over the terms and cache the highest number of weeks
        _.each(terms, function(term) {
            var weeksInTerm = gh.utils.getWeeksInTerm(term);
            if (weeksInTerm > maxWeeks) {
                maxWeeks = weeksInTerm;
            }
        });
        // Return the maximum number of weeks in the term
        return maxWeeks;
    };

    /**
     * Delete all selected events that fall on a certain day of the week
     *
     * @private
     */
    var deleteDay = function() {
        // Get the day of the week to delete events for
        var dayToDelete = parseInt($($(this).prevAll('.gh-batch-edit-day-picker')).val(), 10);

        var $rows = $('.gh-batch-edit-events-container tr.info:visible');

        // Keep track of progress
        var totalEvents = $rows.length;
        var currentEvent = 0;

        // Loop over the selected events
        _.each($rows, function($row) {
            _.defer(function() {
                $row = $($row);

                // Get the date the event starts on
                var eventStart = new Date($row.find('.gh-event-date').attr('data-start'));

                // If the event falls on the day that needs to be deleted, delete it
                if (eventStart.getDay() === dayToDelete) {
                    $($row.find('.gh-event-delete button')).click();
                }

                // Update processing progress indication
                currentEvent = currentEvent + 1;
                updateEventManipulationProgress(currentEvent, totalEvents);
            });
        });
    };

    /**
     * Batch edit the time on which events start and finish
     *
     * @private
     */
    var batchEditTime = function() {
        // Keep track of whether or not the day of the week needs to change
        var dayChange = $(this).hasClass('gh-batch-edit-day-picker');
        // Get the container in which the edits where made
        var $timeContainer = $($(this).closest('.gh-batch-edit-time-picker'));
        // Get the values that changed
        var prevEventDay = parseInt($('.gh-batch-edit-day-picker', $timeContainer).data('prev'), 10);
        var eventDay = parseInt($('.gh-batch-edit-day-picker', $timeContainer).val(), 10);
        var eventStartHour = parseInt($('.gh-batch-edit-hours-start', $timeContainer).val(), 10);
        var eventStartMinute = parseInt($('.gh-batch-edit-minutes-start', $timeContainer).val(), 10);
        var eventEndHour = parseInt($('.gh-batch-edit-hours-end', $timeContainer).val(), 10);
        var eventEndMinute = parseInt($('.gh-batch-edit-minutes-end', $timeContainer).val(), 10);

        // Loop over the selected events and change the ones that match the previous eventDay
        // value (assuming it was changed)
        var $selectedRows = $('.gh-batch-edit-events-container tr.info:visible');
        // Filter the rows that are eligible for updating
        var $rows = getEligibleRows($selectedRows);

        // Keep track of progress
        var totalEvents = $rows.length;
        var currentEvent = 0;

        // Mark the rows that are not eligible for updating
        $(_.difference($selectedRows, $rows)).addClass('gh-not-eligible');

        _.each($rows, function($row) {
            _.defer(function() {
                $row = $($row);
                // Get the date the event starts on
                var eventStart = moment.tz($row.find('.gh-event-date').attr('data-start'), 'Europe/London');
                // Retrieve the day number
                var eventStartDayNumber = parseInt(moment.tz(eventStart, 'Europe/London').format('E'), 10);
                // Only update the date when the event takes place on the day that was selected in the picker
                var dayNumberToEdit = parseInt(prevEventDay, 10);
                if (eventStartDayNumber === dayNumberToEdit) {
                    // Get the date the event finishes on
                    var eventEnd = moment.tz($row.find('.gh-event-date').attr('data-end'), 'Europe/London');
                    // Get which week of the term this event takes place in
                    var weekInTerm = gh.utils.getAcademicWeekNumber(gh.utils.convertISODatetoUnixDate(moment.tz(eventStart, 'Europe/London').format()));
                    // Get the name of the term this date is in
                    var termName = $row.closest('.gh-batch-edit-events-container').attr('data-term');
                    // Get the date the event would be on after the change
                    // Since Cambridge weeks start on Thursdays, we should prevent that
                    // chosen days are put after the current selected day. Therefore
                    // we need to subtract one week for all the days except Tuesdays and
                    // Wednesdays (We have a 2 day offset, since terms start on Tuesdays, sigh).
                    var newDate = gh.utils.getDateByWeekAndDay(termName, weekInTerm, eventDay);
                    if (_.contains([2,3], eventDay)) {
                        newDate = moment.tz(newDate, 'Europe/London').add({'weeks': 1});
                    }

                    // Only update the year/month/day when we change the day
                    if (!dayChange) {
                        newDate = moment.tz(newDate, 'Europe/London').year(moment.tz(eventEnd, 'Europe/London').format('YYYY'));
                        newDate = moment.tz(newDate, 'Europe/London').month(moment.tz(eventEnd, 'Europe/London').format('MM'));
                        newDate = moment.tz(newDate, 'Europe/London').date(moment.tz(eventEnd, 'Europe/London').format('DD'));
                    }

                    // Retrieve and calculate the event dates
                    var newDateYear = moment.tz(newDate, 'Europe/London').format('YYYY');
                    var newDateMonth = parseInt(moment.tz(newDate, 'Europe/London').format('MM'), 10) - 1;
                    var newDateDay = moment.tz(newDate, 'Europe/London').add({'hours': 1}).format('DD');

                    // Create the new date for the row
                    eventStart = moment.tz([newDateYear, newDateMonth, newDateDay, eventStartHour, eventStartMinute, 0, 0], 'Europe/London').format();
                    eventEnd = moment.tz([newDateYear, newDateMonth, newDateDay, eventEndHour, eventEndMinute, 0, 0], 'Europe/London').format();

                    // Re-render the date fields
                    gh.utils.renderTemplate('admin-edit-date-field', {
                        'data': {
                            'start': eventStart,
                            'end': eventEnd
                        },
                        'utils': gh.utils
                    }, null, function(template) {

                        // Update the trigger
                        $row.find('.gh-event-date').attr('data-start', eventStart).attr('data-end', eventEnd).html(template);

                        // Trigger a change of the datepicker
                        $(document).trigger('gh.datepicker.change', $row.find('.gh-event-date'));
                    });
                }

                // Update processing progress indication
                currentEvent = currentEvent + 1;
                updateEventManipulationProgress(currentEvent, totalEvents);
            });
        });
    };

    /**
     * Batch edit weeks by adding and removing events based on the selection
     *
     * @private
     */
    var batchEditDateWeeks = function() {
        // If the input field is checked, add the appropriate class to its parent
        if ($(this).is(':checked')) {
            // Add the class
            $(this).closest('.checkbox').addClass('gh-batch-edit-date-picker-selected');
            // Add all events to the associated week
            addAnotherEvent();
            // Track the user adding a week to the selection
            gh.utils.trackEvent(['Data', 'Batch edit', 'TimeDate', 'Week ticked on']);
        } else {
            // Remove the class
            $(this).closest('.checkbox').removeClass('gh-batch-edit-date-picker-selected');
            // Remove all events associated to the week
            removeEventsInWeek(parseInt($(this).val(), 10));
            // Track the user removing a week to the selection
            gh.utils.trackEvent(['Data', 'Batch edit', 'TimeDate', 'Week ticked off']);
        }
        // Update the batch edit header
        buildBatchDateObject();
    };

    /**
     * Automatically update the start time based on the end time selection to avoid unlikely time settings.
     * e.g., having already set an start time of 9AM and updating the end time to 8AM will trigger the function
     * and change the start time to be 7AM, one hour earlier than the selected end time
     *
     * @param  {jQuery}    $startContainer    jQuery selector of the container holding the start hours and minutes
     * @param  {jQuery}    $endContainer      jQuery selector of the container holding the end hours and minutes
     * @private
     */
    var updateStartTime = function($startContainer, $endContainer) {
        // Get the start and end times
        var startHour = parseInt($startContainer.find('.gh-batch-edit-hours-start').val(), 10);
        var startMinute = parseInt($startContainer.find('.gh-batch-edit-minutes-start').val(), 10);
        var endHour = parseInt($endContainer.find('.gh-batch-edit-hours-end').val(), 10);
        var endMinute = parseInt($endContainer.find('.gh-batch-edit-minutes-end').val(), 10);

        // Create a time we can calculate with
        var startTime = parseFloat(startHour + '.' + startMinute);
        var endTime = parseFloat(endHour + '.' + endMinute);

        // If the end time is earlier than the start, turn down start time
        if (endTime <= startTime) {
            if (endHour !== 7) {
                startHour = endHour - 1;
            } else {
                startHour = endHour;
                startMinute = 0;
                // If the event starts and finishes on 0 minutes, bump the end to 15 minutes to avoid
                // duplicate start and end times
                if (endMinute === 0) {
                    endMinute = 15;
                }
            }

            // update the start hours/minutes and end minutes
            $startContainer.find('.gh-batch-edit-hours-start').val(startHour);
            $startContainer.find('.gh-batch-edit-minutes-start').val(startMinute);
            $endContainer.find('.gh-batch-edit-minutes-end').val(endMinute);
        }
    };

    /**
     * Automatically update the end time based on the start time selection to avoid unlikely time settings.
     * e.g., having already set an end time of 8AM and updating the start to 10AM will trigger the function
     * and change the end time to be 11AM, one hour later than the selected start time
     *
     * @param  {jQuery}    $startContainer    jQuery selector of the container holding the start hours and minutes
     * @param  {jQuery}    $endContainer      jQuery selector of the container holding the end hours and minutes
     * @private
     */
    var updateEndTime = function($startContainer, $endContainer) {
        // Get the start and end times
        var startHour = parseInt($startContainer.find('.gh-batch-edit-hours-start').val(), 10);
        var startMinute = parseInt($startContainer.find('.gh-batch-edit-minutes-start').val(), 10);
        var endHour = parseInt($endContainer.find('.gh-batch-edit-hours-end').val(), 10);
        var endMinute = parseInt($endContainer.find('.gh-batch-edit-minutes-end').val(), 10);

        // Create a time we can calculate with
        var startTime = parseFloat(startHour + '.' + startMinute);
        var endTime = parseFloat(endHour + '.' + endMinute);

        // If the start is later than the end, crank up the end time
        if (startTime >= endTime) {
            if (startHour !== 19) {
                endHour = startHour + 1;
            } else {
                endHour = startHour;
                endMinute = 45;
                // If the event starts and finishes on 45 minutes, trim the start to 30 minutes to avoid
                // duplicate start and end times
                if (startMinute === 45) {
                    startMinute = 30;
                }
            }

            // Update the end hours/minutes and start minutes
            $endContainer.find('.gh-batch-edit-hours-end').val(endHour);
            $endContainer.find('.gh-batch-edit-minutes-end').val(endMinute);
            $startContainer.find('.gh-batch-edit-minutes-start').val(startMinute);
        }
    };

    /**
     * Determine whether the end or start times should be looked at for valid input and run the functions that
     * take care of any unusual time selections.
     *
     * @private
     */
    var preBatchEditAdjustTime = function() {
        // If the batch-edit-day-picker select element has an extra `Choose day` option, the days haven't
        // actually been generated yet and we do that first
        if ($(this).hasClass('gh-batch-edit-day-picker') && $(this).find('option[value=7]').length) {
            generateOtherDays.apply(this);
        // The select element has no extra `Choose day` option, we update the existing events in the terms.
        // If hours/minutes are adjusted and not days we update the events as well
        } else {
            // Get the start and end containers
            var $startContainer = $($(this).closest('.gh-batch-edit-time-picker')).find('.gh-batch-edit-date-start');
            var $endContainer = $($(this).closest('.gh-batch-edit-time-picker')).find('.gh-batch-edit-date-end');

            // Check if hours or minutes where changed
            if ($(this).hasClass('gh-batch-edit-hours-picker')) {
                // Check if the start or end time was edited and update the time accordingly
                if ($(this).parent().hasClass('gh-batch-edit-date-start')) {
                    updateEndTime($startContainer, $endContainer);
                } else {
                    updateStartTime($startContainer, $endContainer);
                }
            } else {
                // Check if the start or end time was edited and update the time accordingly
                if ($(this).parent().hasClass('gh-batch-edit-date-start')) {
                    updateEndTime($startContainer, $endContainer);
                } else {
                    updateStartTime($startContainer, $endContainer);
                }
            }

            // Batch edit time after all tweaks have been made to the time
            batchEditTime.apply(this);
        }
    };

    /**
     * Remove a helper class from all checkbox containers that visually indicate focus
     *
     * @private
     */
    var blurEditDateWeeks = function() {
        $('#gh-batch-edit-date-picker .checkbox').removeClass('gh-focus');
    };

    /**
     * Add a helper class to the focused checkbox containers to visually indicate focus
     *
     * @private
     */
    var focusEditDateWeeks = function() {
        $(this).closest('.checkbox').addClass('gh-focus');
    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    /**
     * Add handlers to various elements in batch date edit
     *
     * @private
     */
    var addBinding = function() {
        // Initialisation
        $(document).on('gh.batchdate.setup', buildBatchDateObject);
        $(document).on('gh.datepicker.change', buildBatchDateObject);

        // Used to throttle function calls
        var delayed = null;
        $('body').on('change', '.gh-select-single', function() {
            // Clear the timeout to reset the timer
            clearTimeout(delayed);
            // Set a delay on the function call to allow combining of multiple events
            delayed = setTimeout(function () {
                // The timeout passed and the function gets called
                buildBatchDateObject();
            }, 1);
        });

        $('body').on('change', '.gh-select-all', buildBatchDateObject);

        // Week checkbox related events
        $('body').on('change', '#gh-batch-edit-date-picker-container input', batchEditDateWeeks);
        $('body').on('focus', '#gh-batch-edit-date-picker-container input', focusEditDateWeeks);
        $('body').on('blur', '#gh-batch-edit-date-picker-container input', blurEditDateWeeks);

        // Date picker related events
        $('body').on('change', '.gh-batch-edit-day-picker', function(ev) {
            gh.utils.trackEvent(['Data', 'Batch edit', 'TimeDate', 'Day changed']);
            preBatchEditAdjustTime.apply(this);
        });
        $('body').on('change', '.gh-batch-edit-hours-start', function() {
            gh.utils.trackEvent(['Data', 'Batch edit', 'TimeDate', 'Start hour changed']);
            preBatchEditAdjustTime.apply(this);
        });
        $('body').on('change', '.gh-batch-edit-hours-end', function() {
            gh.utils.trackEvent(['Data', 'Batch edit', 'TimeDate', 'End hour changed']);
            preBatchEditAdjustTime.apply(this);
        });
        $('body').on('change', '.gh-batch-edit-minutes-start', function() {
            gh.utils.trackEvent(['Data', 'Batch edit', 'TimeDate', 'Start minute changed']);
            preBatchEditAdjustTime.apply(this);
        });
        $('body').on('change', '.gh-batch-edit-minutes-end', function() {
            gh.utils.trackEvent(['Data', 'Batch edit', 'TimeDate', 'End minute changed']);
            preBatchEditAdjustTime.apply(this);
        });

        // Delete a day
        $('body').on('click', '.gh-batch-edit-date-delete', deleteDay);

        // Adding a new day
        $('body').on('click', '.gh-batch-edit-date-add-day', addAnotherDay);

        // Removing events
        $(document).on('gh.event.deleted', buildBatchDateObject);
    };

    addBinding();
});
