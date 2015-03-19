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

define(['gh.core', 'gh.new-module', 'gh.borrow-series', 'gh.new-series', 'clickover'], function(gh) {

    /**
     * Set up the modules of events in the sidebar. Note that the generic gh.listview.js does
     * all the heavy lifting and this function handles admin-specific functionality
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected part to fetch modules for
     * @private
     */
    var setUpModules = function(ev, data) {
        // Hide the tripos help text
        $('.gh-tripos-help').hide();
    };

    /**
     * Select a series to show from the modules list
     *
     * @private
     */
    var selectSeries = function() {
        var moduleId = $(this).closest('ul').closest('.list-group-item').data('id');
        var seriesId = $(this).closest('.list-group-item').data('id');
         // Push the selected module and series in the URL
        gh.utils.addToState({
            'module': moduleId,
            'series': seriesId
        });
    };

    /**
     * Set up and show the series popover
     *
     * @private
     */
    var setUpSeriesPopover = function() {
        var $trigger = $(this);
        var $content = $('.gh-series-select .popover[data-id="' + $trigger.data('id') + '"]');

        var options = {
            'class_name': 'gh-series-popover',
            'container': 'body',
            'content': $content.html(),
            'global_close': true,
            'html': true
        };

        $trigger.clickover(options);
        $trigger.trigger('click');
    };

    /**
     * Dismiss the popover window
     *
     * @private
     */
    var dismissSeriesPopover = function() {
        var $trigger = $(this);
        // Only invoke a click when a popover is actually being shown
        if ($('.popover.in').length) {
            $trigger.trigger('click');
        }
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the listview
     *
     * @private
     */
    var addBinding = function() {
        // Select a series in the sidebar
        $('body').on('click', '.gh-series-select', selectSeries);

        // Show extra information for the borrowed series
        $('body').on('mouseover', '.gh-series-select .fa-link', setUpSeriesPopover);
        // Hide the popover window
        $('body').on('mouseout', '.gh-series-select .fa-link', dismissSeriesPopover);

        // Set up the modules in the sidebar
        $(document).on('gh.part.selected', setUpModules);
    };

    addBinding();
});
