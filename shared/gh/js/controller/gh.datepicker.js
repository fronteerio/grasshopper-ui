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

define(['gh.core', 'moment', 'clickover', 'jquery-datepicker'], function(gh, moment) {

    var $trigger = null;


    /////////////////////
    //  DATA HANDLING  //
    /////////////////////

    /**
     * Apply the date change
     *
     * @private
     */
    var applyDateChange = function() {
        // Get the form values
        var entries = getFormValues();

        // Generate the start and end dates
        var startDate = moment(entries.date).add({'h': entries.startHour, 'm': entries.startMinutes}).utc().format();
        var endDate = moment(entries.date).add({'h': entries.endHour, 'm': entries.endMinutes}).utc().format();

        // Update the trigger
        $trigger.data('start', startDate).data('end', endDate).html(startDate + ' - ' + endDate);

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
        var startHour = parseInt($('#gh-edit-dates-form #gh-module-from-hour').val(), 10);
        var startMinutes = parseInt($('#gh-edit-dates-form #gh-module-from-minutes').val(), 10);
        var endHour = parseInt($('#gh-edit-dates-form #gh-module-to-hour').val(), 10);
        var endMinutes = parseInt($('#gh-edit-dates-form #gh-module-to-minutes').val(), 10);

        return {
            'date': date,
            'startHour': startHour,
            'startMinutes': startMinutes,
            'endHour': endHour,
            'endMinutes': endMinutes
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
        // Chech whether the entered ranges are valid
        if (!isValidRange()) {
            return $('#gh-edit-dates-apply').attr('disabled','disabled');
        }

        // Enable the submit button if the entries are valid
        if ($('#gh-edit-dates-apply').attr('disabled')) {
            $('#gh-edit-dates-apply').removeAttr('disabled');
        }
    };


    ///////////////////
    //  DATE PICKER  //
    ///////////////////

    /**
     * Render the date picker
     *
     * @private
     */
    var renderDatePicker = function() {
        $('.popover #gh-datepicker').datepicker({
            'dateFormat': "yy-mm-dd",
            'dayNamesMin': ['S','M','T','W','T','F','S'],
            'firstDay': 4,
            'nextText': '<i class="fa fa-chevron-right"></i>',
            'prevText': '<i class="fa fa-chevron-left"></i>',
            'showOtherMonths': true,
            'selectOtherMonths': true,
            'onSelect': validateEntry
        });
    };

    /**
     * Set the original date and time
     *
     * @private
     */
    var setCalendarDate = function() {
        // Set the current date
        var dayValue = moment($trigger.data('start')).utc().format('YYYY-MM-DD');
        $('.popover #gh-datepicker').datepicker('setDate', dayValue);

        // Set the correct select box values
        $('#gh-module-from-hour').val(moment($trigger.data('start')).utc().format('HH'));
        $('#gh-module-from-minutes').val(moment($trigger.data('start')).utc().format('mm'));

        $('#gh-module-to-hour').val(moment($trigger.data('end')).utc().format('HH'));
        $('#gh-module-to-minutes').val(moment($trigger.data('end')).utc().format('mm'));
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
    };

    /**
     * Show the popover window
     *
     * @private
     */
    var showPopover = function() {
        // Render the popover template
        var content = gh.api.utilAPI.renderTemplate($('#gh-datepicker-popover-template'), {
            'data': {
                'gh': gh,
                'interval': {
                    'hours': 1,
                    'minutes': 15
                }
            }
        });

        // Cache the trigger
        $trigger = $(this);

        // Show the popover window
        _.defer(function() {
            $trigger.clickover({
                'container': 'body',
                'content': content,
                'global_close': false,
                'html': true,
                'placement': 'bottom',
                'onShown': function() {
                    renderDatePicker();
                    setCalendarDate();
                }
            });
            $trigger.trigger('click');
        });
    };


    ///////////////
    //  BINDING  //
    ///////////////

    /**
     * Add handlers to various elements in the date picker popover
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('change', '#gh-edit-dates-form select', validateEntry);
        $('body').on('click', '#gh-edit-dates-apply', applyDateChange);
        $('body').on('click', '#gh-edit-dates-cancel', dismissPopover);
        $('body').on('click', '.gh-event-date', showPopover);
    };

    addBinding();
});
