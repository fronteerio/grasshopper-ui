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

define(['gh.core', 'moment', 'clickover', 'jquery-datepicker'], function(gh, moment) {

    var $trigger = null;
    var components = null;
    var hasChanges = false;


    /////////////////////
    //  DATA HANDLING  //
    /////////////////////

    /**
     * Apply the date change
     *
     * @private
     */
    var applyDateChange = function() {

        // Retrieve the entered dates
        var dates = getFullDates();

        // Render the content
        var content = gh.utils.renderTemplate($('#gh-edit-date-field-template'), {
            'data': {
                'start': dates.start,
                'end': dates.end
            },
            'utils': gh.utils
        });

        // Update the trigger
        $trigger.attr('data-start', dates.start).attr('data-end', dates.end).html(content);

        // Close the popover window
        dismissPopover();
    };

    /**
     * Return the entered dates
     *
     * @return {Object}    Object containing the entered dates
     * @private
     */
    var getFormValues = function() {

        // Retrieve the selected date from the calendar
        var date = $('.popover #gh-datepicker').datepicker('getDate');

        // Retrieve the form values
        var week = parseInt($('#gh-edit-dates-form #gh-module-week').val(), 10);
        var day = parseInt($('#gh-edit-dates-form #gh-module-day').val(), 10);
        var startHour = parseInt($('#gh-edit-dates-form #gh-module-from-hour').val(), 10);
        var startMinutes = parseInt($('#gh-edit-dates-form #gh-module-from-minutes').val(), 10);
        var endHour = parseInt($('#gh-edit-dates-form #gh-module-to-hour').val(), 10);
        var endMinutes = parseInt($('#gh-edit-dates-form #gh-module-to-minutes').val(), 10);

        return {
            'date': date,
            'week': week,
            'day': day,
            'startHour': startHour,
            'startMinutes': startMinutes,
            'endHour': endHour,
            'endMinutes': endMinutes
        };
    };

    /**
     * Return the fully constructed date based on the entries
     *
     * @return  {Object}    Object containing the full start- and end dates
     * @private
     */
    var getFullDates = function() {
        // Retrieve the entered values
        var entries = getFormValues();

        // Generate the start and end dates
        var startDate = moment(entries.date).add({'h': entries.startHour, 'm': entries.startMinutes}).utc().format();
        var endDate = moment(entries.date).add({'h': entries.endHour, 'm': entries.endMinutes}).utc().format();

        // Return the full dates
        return {
            'start': startDate,
            'end': endDate
        };
    };

    /**
     * Validate the entered dates
     *
     * @return {Boolean}    Whether the entered time span is valid or not
     * @private
     */
    var isValidRange = function() {
        // Get the form values
        var entries = getFormValues();
        // Compare and return the difference
        return ((entries.startHour + (entries.startMinutes * 0.01)) < (entries.endHour + (entries.endMinutes * 0.01)));
    };

    /**
     * Validate the entered dates
     *
     * @private
     */
    var validateEntry = function() {
        // Check whether the entered ranges are valid
        if (!isValidRange()) {
            hasChanges = false;
            return $('#gh-edit-dates-apply').attr('disabled','disabled');
        }

        // Enable the submit button if the entries are valid
        if ($('#gh-edit-dates-apply').attr('disabled')) {
            hasChanges = true;
            $('#gh-edit-dates-apply').removeAttr('disabled');
        }
    };


    /////////////////
    //  CLICKOVER  //
    /////////////////

    /**
     * Dismiss the popover window
     *
     * @private
     */
    var dismissPopover = function() {
        $trigger.trigger('click');
        $trigger.focus();

        // Toggle the submit button in the batch edit
        if (hasChanges) {
            $(document).trigger('gh.datepicker.change', $trigger);
        }
    };

    /**
     * Show the popover window
     *
     * @param  {Event}     ev         Standard jQuery event
     * @param  {Object}    trigger    jQuery object representing the trigger
     * @private
     */
    var showPopover = function(ev, trigger) {
        // Calculate the number of weeks in a term based on the date
        var numWeeks = 0;
        var term = gh.utils.getTerm(gh.utils.convertISODatetoUnixDate($(trigger).data('start')));
        if (term) {
            numWeeks = gh.utils.getWeeksInTerm(term);
        }

        // Render the popover template
        var content = gh.utils.renderTemplate($('#gh-datepicker-popover-template'), {
            'data': {
                'gh': gh,
                'numWeeks': numWeeks,
                'interval': {
                    'hours': 1,
                    'minutes': 15
                }
            }
        });

        // Cache the trigger
        $trigger = $(trigger);

        // Show the popover window
        _.defer(function() {
            $trigger.clickover({
                'container': 'body',
                'content': content,
                'global_close': false,
                'html': true,
                'placement': 'bottom',
                'onShown': function() {

                    // Cache the trigger
                    $trigger = $(trigger).closest('tr .gh-event-date');

                    // Cache the delegating components
                    components = [
                        $('#gh-datepicker'),
                        $('#gh-module-week'),
                        $('#gh-module-day')
                    ];

                    initialiseDatePicker();
                    setCalendarDate();

                    // Set the focus on current day of the calendar
                    $('.popover .ui-state-active').focus();
                }
            });
            $trigger.trigger('click');
        });
    };


    ///////////////////
    //  DATE PICKER  //
    ///////////////////

    /**
     * Initialise the date picker
     *
     * @private
     */
    var initialiseDatePicker = function() {
        $('.popover #gh-datepicker').datepicker({
            'dateFormat': "yy-mm-dd",
            'dayNamesMin': ['S','M','T','W','T','F','S'],
            'firstDay': 4,
            'nextText': '<i class="fa fa-chevron-right"></i>',
            'prevText': '<i class="fa fa-chevron-left"></i>',
            'showOtherMonths': true,
            'selectOtherMonths': true,
            'onSelect': onDatepickerChange
        });
    };

    /**
     * Navigate to a specific date in the calendar
     *
     * @param  {String}    date    The date that needs to be displayed in the calendar
     * @private
     */
    var setDate = function(date) {
        $('.popover #gh-datepicker').datepicker('setDate', date);
    };


    /**
     * Set the original date and time
     *
     * @private
     */
    var setCalendarDate = function() {
        // Set the current date
        var dayValue = moment($trigger.attr('data-start')).utc().format('YYYY-MM-DD');
        setDate(dayValue);

        // Set the correct select box values
        var startDate = gh.utils.convertUnixDatetoISODate(gh.utils.fixDateToGMT($trigger.attr('data-start')));
        var endDate = gh.utils.convertUnixDatetoISODate(gh.utils.fixDateToGMT($trigger.attr('data-end')));
        var week = gh.utils.getAcademicWeekNumber(gh.utils.convertISODatetoUnixDate(startDate));
        var day = moment(startDate).day();

        $('.popover #gh-module-week').val(week);
        $('.popover #gh-module-day').val(day);

        $('.popover #gh-module-from-hour').val(moment(startDate).utc().format('HH'));
        $('.popover #gh-module-from-minutes').val(moment(startDate).utc().format('mm'));

        $('.popover #gh-module-to-hour').val(moment(endDate).utc().format('HH'));
        $('.popover #gh-module-to-minutes').val(moment(endDate).utc().format('mm'));
    };

    /**
     * Function that is executed when the datepicker value was changed
     *
     * @private
     */
    var onDatepickerChange = function() {
        updateDateComponents('#gh-datepicker');
        validateEntry();
    };


    ////////////////////
    //  FORM CHANGES  //
    ////////////////////


    /**
     * Function that is executed when the week has been changed
     *
     * @private
     */
    var onWeekChange = function() {
        updateDateComponents('#gh-module-week');
        validateEntry();
    };

    /**
     * Function that is exectued when the day has been changed
     *
     * @private
     */
    var onDayChange = function() {
        updateDateComponents('#gh-module-day');
        validateEntry();
    };


    ///////////////
    //  BINDING  //
    ///////////////

    /**
     * Update the date components
     *
     * @param  {String}    trigger    The ID of the component that invoked the change
     * @private
     */
    var updateDateComponents = function(trigger) {
        // Get the form values
        var dates = getFullDates();

        var week = gh.utils.getWeekInTerm(dates.start);
        var day = moment(dates.start).day();

        // Re calculate the date based on the selected week
        if (trigger === '#gh-module-week') {
            // Retrieve the chosen week
            var weekVal = parseInt($('#gh-module-week').val(), 10);
            if (weekVal) {
                // Retrieve the term
                var term = gh.utils.getTermByDate(dates.start);
                if (term) {
                    // Retrieve the day of the week
                    var dayOfTheWeek = parseInt(moment(dates.start).format('E'));

                    // Set the date based on the term, week number and day of the week
                    setDate(moment(gh.utils.getDateByWeekAndDay(term.name, weekVal, dayOfTheWeek)).utc().format('YYYY-MM-DD'));
                }
            }

        // Recalculate the date based on the selected day
        } else if (trigger === '#gh-module-day') {
            // Calculate the start of the week
            var startOfTheWeek = moment(dates.start).startOf('week').subtract({'days': 3});

            // Retrieve the selected day value
            var dayVal = parseInt($('#gh-module-day option:selected').attr('data-day'), 10);

            // Set the date
            setDate(moment(startOfTheWeek).add({'days': dayVal}).utc().format('YYYY-MM-DD'));
        }

        // Update all the components except the trigger
        _.each(components, function(component) {
            if ($(component).selector !== $(trigger).selector) {
                if ($(component).selector === '#gh-module-week') {
                    $(component).val(week);
                } else if ($(component).selector === '#gh-module-day') {
                    $(component).val(day);
                }
            }
        });
    };

    /**
     * Handles keypress events when focus is set to the editable event date field
     *
     * @param  {Event}    ev    Standard jQuery keypress event
     * @private
     */
    var handleKeyPress = function(ev) {
        var key = parseInt(ev.which, 10);
        if (key === 32 || key === 13) {
            $(this).click();
        }
    };

    /**
     * Add handlers to various elements in the date picker popover
     *
     * @private
     */
    var addBinding = function() {
        // Form submission
        $('body').on('click', '#gh-edit-dates-apply', applyDateChange);
        $('body').on('click', '#gh-edit-dates-cancel', dismissPopover);

        // Keyboard accessibility
        $('body').on('keypress', '.gh-event-date', handleKeyPress);

        // Utilities
        $('body').on('change', '#gh-edit-dates-form select', validateEntry);

        // Week change
        $('body').on('change', '#gh-module-week', onWeekChange);
        $('body').on('change', '#gh-module-day', onDayChange);

        // Setup
        $(document).on('gh.datepicker.show', showPopover);
    };

    addBinding();
});
