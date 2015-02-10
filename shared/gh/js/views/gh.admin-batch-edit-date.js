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

define(['lodash', 'moment', 'gh.api.util', 'gh.api.config'], function(_, moment, utilAPI, configAPI) {


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
        utilAPI.renderTemplate($('#gh-batch-edit-date-template'), {
            'gh': require('gh.core'),
            'numberOfWeeks': maxNumberOfWeeks,
            'weeksInUse': weeksInUse,
            'termsInUse': termsInUse,
            'daysInUse': daysInUse
        }, $('#gh-batch-edit-date-container'));
    };

    /**
     * Build the data object required to render the date batch edit template
     *
     * @private
     */
    var buildBatchDateObject = function() {
        // Get the checked events from the batch edit container
        var $rows = $('.gh-batch-edit-events-container tr.info');
        // Get the maximum number of weeks in a term
        var maxNumberOfWeeks = getMaxNumberOfWeeks();
        // Get the weeks that are in use by the selection
        var weeksInUse = getWeeksInUse($rows);
        // Get the term data for the selection
        var termsInUse = getTermsInUse($rows);
        // Get the unique days in the week to render time pickers for
        var daysInUse = getDaysInUse($rows);
        // Render the batch date editor
        renderBatchDate(maxNumberOfWeeks, weeksInUse, termsInUse, daysInUse);
    };


    ///////////////
    // UTILITIES //
    ///////////////

    /**
     * Remove events from a specified week number
     *
     * @param  {Number}    weekNumber    The week number to delete events from
     * @private
     */
    var removeEventsInWeek = function(weekNumber) {
        // Get the checked events from the batch edit container
        var $rows = $('.gh-batch-edit-events-container tr.info');
        // For each row, check if the event is taking place in the week that is to be removed
        _.each($rows, function($row) {
            $row = $($row);
            // Get the start date of the event
            var startDate = $row.find('.gh-event-date').attr('data-start');
            // Get the week in which the event takes place
            var dateWeek = utilAPI.getWeekInTerm(startDate);
            // If the event takes place in the week that needs to be removed, delete it
            if (dateWeek === weekNumber) {
                $row.find('.gh-event-delete').click();
            }
        });
    };

    /**
     * Add another day to the terms based on the selection of weeks
     *
     * @param {Number}    [weekNumber]    The optional number of the week to add the events to
     * 
     * @private
     */
    var addAnotherDay = function(weekNumber) {
        // Default the container to look for selected weeks in
        var $weeks = $('#gh-batch-edit-date-picker input:checked');
        // If a weeknumber is defined, only add events to that week
        if (weekNumber) {
            $weeks = $('#gh-batch-edit-date-picker input[value="' + weekNumber + '"]');
        }

        // For each term selected, add events
        _.each($('#gh-batch-edit-date-picker-container').data('terms').split(','), function(termName) {
            // For each selected week, add events
            _.each($weeks, function(chk) {
                // For each row of days, add the event
                _.each($('.gh-batch-edit-time-picker'), function($timePickerContainer) {
                    // Get the week number
                    var eventWeek = parseInt(chk.value, 10);
                    // Get the day number
                    var eventDay = parseInt($('#gh-batch-edit-day-picker', $timePickerContainer).val(), 10);
                    // Get the date by week and day
                    var dateByWeekAndDay = utilAPI.getDateByWeekAndDay(termName, eventWeek, eventDay);

                    var eventYear = dateByWeekAndDay.getFullYear();
                    var eventMonth = dateByWeekAndDay.getMonth();
                    eventDay = dateByWeekAndDay.getDate();
                    var eventStartHour = parseInt($('#gh-batch-edit-hours-start', $timePickerContainer).val(), 10);
                    var eventStartMinute = parseInt($('#gh-batch-edit-minutes-start', $timePickerContainer).val(), 10);
                    var eventEndHour = parseInt($('#gh-batch-edit-hours-end', $timePickerContainer).val(), 10);
                    var eventEndMinute = parseInt($('#gh-batch-edit-minutes-end', $timePickerContainer).val(), 10);

                    // Create the start date of the event
                    var startDate = moment([eventYear, eventMonth, eventDay, eventStartHour, eventStartMinute, 0, 0]);
                    // Create the end date of the event
                    var endDate = moment([eventYear, eventMonth, eventDay, eventEndHour, eventEndMinute, 0, 0]);

                    // Send off an event that will be picked up by the batch edit and add the rows to the terms
                    $(document).trigger('gh.batchedit.addevent', {
                        'eventContainer': $('.gh-batch-edit-events-container[data-term="' + termName + '"]').find('tbody'),
                        'eventObj': {
                            'tempId': utilAPI.generateRandomString(), // The actual ID hasn't been generated yet
                            'isNew': true, // Used in the template to know this one needs special handling
                            'selected': true,
                            'displayName': $('.gh-jeditable-series-title').text(),
                            'end': moment(endDate).utc().format(),
                            'location': '',
                            'notes': 'Lecture',
                            'organisers': null,
                            'start': moment(startDate).utc().format()
                        }
                    });
                });
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
            var startDate = new Date($row.find('.gh-event-date').attr('data-start'));
            var endDate = new Date($row.find('.gh-event-date').attr('data-end'));
            var dayOfTheWeek = new Date(startDate).getDay();
            daysObj[dayOfTheWeek] = {
                'startHour': startDate.getHours(),
                'endHour': endDate.getHours(),
                'startMinute': startDate.getMinutes(),
                'endMinute': endDate.getMinutes()
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
            var start = $(row).find('.gh-event-date').attr('data-start');
            weeksInUse.push(utilAPI.getWeekInTerm(start));
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
            var weeksInTerm = utilAPI.getWeeksInTerm(term);
            if (weeksInTerm > maxWeeks) {
                maxWeeks = weeksInTerm;
            }
        });
        // Return the maximum number of weeks in the term
        return maxWeeks;
    };

    /**
     * Add a helper class to the checked checkbox container to visually indicate selection
     *
     * @private
     */
    var batchEditDateWeeks = function() {
        // If the input field is checked, add the appropriate class to its parent
        if ($(this).is(':checked')) {
            // Add the class
            $(this).closest('.checkbox').addClass('gh-batch-edit-date-picker-selected');
            // Add all events to the associated week
            addAnotherDay(parseInt($(this).val(), 10));
        } else {
            // Remove the class
            $(this).closest('.checkbox').removeClass('gh-batch-edit-date-picker-selected');
            // Remove all events associated to the week
            removeEventsInWeek(parseInt($(this).val(), 10));
        }
        // Get the weeks that are in use by the selection
        var weeksInUse = $('#gh-batch-edit-date-picker input:checked').length;
        // Update the weeks in use label
        weeksInUse = weeksInUse + (weeksInUse === 1 ? ' week' : ' weeks') + ' selected';
        $('#gh-batch-edit-date-picker-container > small').text(weeksInUse);
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

        // Week checkbox related events
        $('body').on('change', '#gh-batch-edit-date-picker-container input', batchEditDateWeeks);
        $('body').on('focus', '#gh-batch-edit-date-picker-container input', focusEditDateWeeks);
        $('body').on('blur', '#gh-batch-edit-date-picker-container input', blurEditDateWeeks);

        // Adding a new day
        $('body').on('click', '.gh-batch-edit-date-add-day', function() {
            // This function takes arguments but we don't need to supply any here, so we
            // call it inside of a function wrapper
            addAnotherDay();
        });
    };

    addBinding();
});
