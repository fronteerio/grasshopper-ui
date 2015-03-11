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

define(['gh.core', 'gh.api.orgunit'], function(gh, orgunitAPI) {

    // Cache the tripos data
    var triposData = null;

    /**
     * Set up the modules of events in the list.
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected part to fetch modules for
     * @private
     */
    var setUpModules = function(ev, data) {
        var partId = parseInt(data.selected, 10);

        $(document).trigger('gh.part.selected', {
            'partId': partId,
            'container': $('#gh-borrow-series-modal'),
            'template': $('#gh-borrow-series-modules-template')
        });
    };

    /**
     * Set up the part picker in the modal
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected tripos to fetch parts for
     * @private
     */
    var setUpPartPicker = function(ev, data) {
        var triposId = parseInt(data.selected, 10);

        // Get the parts associated to the selected tripos
        var parts = _.filter(triposData.parts, function(part) {
            return parseInt(data.selected, 10) === part.ParentId;
        });

        // Render the results in the part picker
        gh.utils.renderTemplate($('#gh-borrow-series-part-template'), {
            'data': {
                'parts': parts
            }
        }, $('#gh-borrow-series-part'));

        // Show the subheader part picker
        $('#gh-borrow-series-part').show();

        // Destroy the field if it's been initialised previously
        $('#gh-borrow-series-part').chosen('destroy').off('change', setUpModules);

        // Initialise the Chosen plugin on the part picker
        $('#gh-borrow-series-part').chosen({
            'no_results_text': 'No matches for',
            'disable_search_threshold': 10
        }).on('change', setUpModules);

        // Chosen has a bug where search sometimes isn't disabled properly
        $('#gh_borrow_series_part_chosen .chosen-search').hide();
    };

    /**
     * Render and show the 'borrow series' modal dialog
     *
     * @private
     */
    var showBorrowSeriesModal = function() {
        // Get the ID of the module to borrow series to
        var moduleId = $(this).closest('.list-group-item').data('id');
        // Get the part ID of the module
        var partId = $(this).closest('#gh-modules-list-container').data('partid');

        // Fetch the triposes
        gh.utils.getTriposStructure(function(err, _triposData) {
            // Cache the triposdata for use in the other picker
            triposData = _triposData;

            // Slim down the dataset before passing it into the template
            var triposPickerData = {
                'courses': triposData.courses
            };

            // Add the optional subject to the course
            _.each(triposPickerData.courses, function(course) {
                course.subjects = _.filter(triposData.subjects, function(subject) {
                    return course.id === subject.ParentId;
                });
            });

            // Render the modal and pickers
            gh.utils.renderTemplate($('#gh-borrow-series-modal-template'), {
                'data': triposPickerData,
                'moduleId': moduleId,
                'partId': partId
            }, $('#gh-modal'));

            // Show the modal
            $('#gh-borrow-series-modal').modal();
        });
    };

    /**
     * Add a series to the list of series that will be borrowed by applying the `gh-borrow-series-borrowed`
     * class to its container
     *
     * @private
     */
    var addSeriesToBorrow = function() {
        $(this).closest('.list-group-item ').addClass('gh-borrow-series-borrowed');
    };

    /**
     * Remove a series from the list of series that will be borrowed by removing the
     * `gh-borrow-series-borrowed` class from its container
     *
     * @private
     */
    var removeSeriesToBorrow = function() {
        $(this).closest('.list-group-item ').removeClass('gh-borrow-series-borrowed');
    };

    /**
     * Collect all series marked as 'to borrow' and borrow them into a module
     *
     * @private
     */
    var borrowSeries = function()  {
        // Get the ID of the module to borrow series to
        var moduleId = $(this).data('moduleid');

        // Get the parent ID of the module
        var partId = $(this).data('partid');

        // Get all series marked as 'to borrow'
        var seriesToBorrow = $('.gh-borrow-series-borrowed', $('#gh-borrow-series-modal'));

        // Get all series' IDs
        var seriesIDs = [];
        _.each(seriesToBorrow, function(series) {
            seriesIDs.push($(series).data('id'));
        });

        // Borrow the event series in the module
        orgunitAPI.addOrgUnitSeries(moduleId, seriesIDs, function(err, data) {
            // Show a success or failure notification
            if (err) {
                return gh.utils.notification('Series not borrowed.', 'The series could not be successfully borrowed.', 'error');
            }
            gh.utils.notification('Series borrowed.', 'The series were successfully borrowed.', 'success');
            // Hide the module modal
            $('#gh-borrow-series-modal').modal('hide');
            // Refresh the modules list
            $(document).trigger('gh.listview.refresh', {
                'partId': partId
            });
        });
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the borrow series modal
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('click', '.gh-borrow-series', showBorrowSeriesModal);
        $('body').on('shown.bs.modal', '#gh-borrow-series-modal', function () {
            // Show the subheader tripos picker
            $('#gh-borrow-series-tripos').show();

            // Destroy the field if it's been initialised previously
            $('#gh-borrow-series-tripos').chosen('destroy').off('change', setUpModules);

            // Initialise the Chosen plugin on the tripos picker
            $('#gh-borrow-series-tripos').chosen({
                'no_results_text': 'No matches for'
            }).change(setUpPartPicker);
        });
        // Mark a series as 'to borrow'
        $('body').on('click', '.gh-borrow-series-select', addSeriesToBorrow);
        // Unmark a series as 'to borrow'
        $('body').on('click', '.gh-borrow-series-deselect', removeSeriesToBorrow);
        // Borrow all series marked as 'to borrow' into a module
        $('body').on('click', '#gh-borrow-series-submit', borrowSeries);
    };

    addBinding();
});
