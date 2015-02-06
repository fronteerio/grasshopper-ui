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

define(['lodash', 'gh.api.util', 'gh.api.config'], function(_, utilAPI, configAPI) {


    ///////////////
    // RENDERING //
    ///////////////

    /**
     * Render the batch edit date container
     *
     * @param  {Number}      maxNumberOfWeeks    The maximum number of weeks in a term associated to the app
     * @param  {Object[]}    weeksInUse          Array containing the numbers of the weeks that are selected
     * @param  {Object[]}    termsInUse          The terms of the events that were selected
     * @private
     */
    var renderBatchDate = function(maxNumberOfWeeks, weeksInUse, termsInUse) {
        utilAPI.renderTemplate($('#gh-batch-edit-date-template'), {
            'gh': require('gh.core'),
            'numberOfWeeks': maxNumberOfWeeks,
            'weeksInUse': weeksInUse,
            'termsInUse': termsInUse
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
        var termsInuse = getTermsInUse($rows);
        // Render the batch date editor
        renderBatchDate(maxNumberOfWeeks, weeksInUse, termsInuse);
    };


    ///////////////
    // UTILITIES //
    ///////////////

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
                var eventStart = new Date($(row).find('.gh-event-date').data('start'));

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
            var start = $(row).find('.gh-event-date').data('start');
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
        // If the input field is checked, add appropriate the class to its parent
        if ($(this).is(':checked')) {
            // Add the class
            $(this).closest('.checkbox').addClass('gh-batch-edit-date-picker-selected');
        } else {
            // Remove the class
            $(this).closest('.checkbox').removeClass('gh-batch-edit-date-picker-selected');
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
    };

    addBinding();
});
