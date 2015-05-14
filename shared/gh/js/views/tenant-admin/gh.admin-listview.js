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

define(['gh.core', 'gh.admin.borrow-series', 'gh.admin.delete-module', 'gh.admin.new-module', 'gh.admin.new-series', 'gh.admin.rename-module', 'gh.series-borrowed-popover', 'clickover'], function(gh) {

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
        // Highlight the selected series
        $('.gh-list-group-item-container').removeClass('gh-series-active');
        $('.list-group-item[data-id="' + History.getState().data.series + '"] .gh-list-group-item-container').addClass('gh-series-active');
        // Make sure its parent is opened
        $('.list-group-item[data-id="' + History.getState().data.series + '"]').parents('.list-group-item').addClass('gh-list-group-item-open');
    };

    /**
     * Select a series to show from the modules list
     *
     * @private
     */
    var selectSeries = function() {
        var moduleId = $(this).closest('ul').closest('.list-group-item').attr('data-moduleid');
        var seriesId = $(this).closest('.list-group-item').attr('data-id');
         // Push the selected module and series in the URL
        gh.utils.addToState({
            'module': moduleId,
            'series': seriesId
        });
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
        // Select a series in the sidebar
        $('body').on('click', '.gh-series-select + .gh-list-action', selectSeries);
        // Set up the modules in the sidebar
        $(document).on('gh.part.selected.admin', setUpModules);
    };

    addBinding();
});
