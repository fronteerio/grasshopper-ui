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

define(['gh.core', 'gh.api.series', 'gh.api.orgunit'], function(gh, seriesAPI, orgUnitAPI) {

    // Cache whether the series is borrowed from another module
    var isBorrowedSeries = false;

    /**
     * Remove a series from the module
     *
     * @private
     */
    var removeSeriesFromModule = function() {
        // Get the ID of the series to remove
        var seriesId = parseInt($.bbq.getState().series, 10);
        // Get the ID of the module to remove the series from
        var moduleId = parseInt($.bbq.getState().module, 10);

        // Remove the series from the module
        gh.api.orgunitAPI.deleteOrgUnitSeries(moduleId, seriesId, function(err) {
            if (err) {
                // Show a failure notification
                gh.utils.notification('Removing series failed.', 'An error occurred while removing the series.', 'error');
            }

            // Hide the modal
            $('#gh-delete-series-modal').modal('hide');

            // Refresh the modules list
            $(document).trigger('gh.listview.refresh', {
                'partId': parseInt($.bbq.getState().part, 10)
            });

            // Show a success notification
            gh.utils.notification('Series removed.', 'The series was successfully removed.');
        });
    };

    /**
     * Delete the series from the module and system
     *
     * @private
     */
    var deleteSeries = function() {
        // Get the ID of the series to delete
        var seriesId = parseInt($.bbq.getState().series, 10);

        // Delete the series
        gh.api.seriesAPI.deleteSeries(seriesId, function(err) {
            if (err) {
                // Show a failure notification
                gh.utils.notification('Deleting series failed.', 'An error occurred while deleting the series.', 'error');
            }

            // Hide the modal
            $('#gh-delete-series-modal').modal('hide');

            // Refresh the modules list
            $(document).trigger('gh.listview.refresh', {
                'partId': parseInt($.bbq.getState().part, 10)
            });

            // Show a success notification
            gh.utils.notification('Series deleted.', 'The series was successfully deleted.');
        });
    };

    /**
     * Determine how to remove the series from the module
     *
     * @private
     */
    var submitDeleteSeries = function() {
        // If the series is borrowed from another module, only remove it from this series
        if (isBorrowedSeries) {
            removeSeriesFromModule();
        // If the series is not borrowed by or from another module, it can be deleted
        } else {
            deleteSeries();
        }
    };

    /**
     * Return whether or not the series is borrowed to another module
     *
     * @param  {Object}     series    The series to determine it was borrowed to another module or not
     * @return {Boolean}              Return `true` if the series was borrowed to another module, `false` if not
     * @private
     */
    var isBorrowedTo = function(series) {
        var isBorrowedTo = false;

        return isBorrowedTo;
    };

    /**
     * Return whether or not the series is borrowed from another module
     *
     * @param  {Object}     series     The series to determine was borrowed or not
     * @return {Boolean}               Return `true` if the series was borrowed from another module, `false` if not
     * @private
     */
    var isBorrowedFrom = function(series) {
        var isBorrowed = false;

        return isBorrowed;
    };

    /**
     * Render and show the 'delete series' modal dialog
     *
     * @private
     */
    var setUpDeleteSeriesModal = function() {
        var seriesId = parseInt($.bbq.getState().series, 10);
        var moduleId = parseInt($.bbq.getState().module, 10);

        gh.api.seriesAPI.getSeries(seriesId, true, function(seriesErr, series) {
            if (seriesErr) {
                gh.utils.notification('Fetching series failed.', 'An error occurred while fetching the series information.', 'error');
            }

            gh.api.orgunitAPI.getOrgUnit(moduleId, false, function(moduleErr, module) {
                if (moduleErr) {
                    gh.utils.notification('Fetching module failed.', 'An error occurred while fetching the module information.', 'error');
                }

                isBorrowedSeries = isBorrowedFrom(series, module);

                // Render the modal
                gh.utils.renderTemplate($('#gh-delete-series-modal-template'), {
                    'data': {
                        'series': series,
                        'module': module,
                        'isBorrowedSeries': isBorrowedSeries
                    }
                }, $('#gh-delete-series-modal-container'));

                // Show the modal
                $('#gh-delete-series-modal').modal();
            });
        });
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the delete series modal
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('click', '.gh-delete-series', setUpDeleteSeriesModal);
        $('body').on('click', '#gh-delete-series-delete', submitDeleteSeries);
    };

    addBinding();
});
