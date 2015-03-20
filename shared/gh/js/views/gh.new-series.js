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

define(['gh.core', 'gh.constants', 'gh.utils', 'gh.api.orgunit', 'gh.api.series', 'gh.api.orgunit'], function(gh, constants, utils, orgunitAPI, seriesAPI, orgUnitAPI) {

    // Keep track of when the user started
    var timeFromStart = null;

    /**
     * Cancel the creation of a new series and return to the last state
     *
     * @private
     */
    var cancelCreateNewSeries = function() {
        // Track the user cancelling creation of a series
        gh.utils.trackEvent(['Manage', 'Add series', 'Cancelled']);
        // Refresh the state to reload the last selected part
        gh.utils.refreshState();
    };

    /**
     * Create a new series
     *
     * @private
     */
    var createNewSeries = function() {
        // Calculate how long it takes the user to create the series
        timeFromStart = (new Date() - timeFromStart) / 1000;
        // Get the AppId
        var appId = require('gh.core').data.me.AppId;
        // Get the displayName
        var displayName = $('#gh-series-name').val();
        // Get the ID of the group that this new series belongs to
        var groupId = $(this).find('button[type="submit"]').data('groupid');
        // Get the ID of the parent that this new series will belong to
        var parentId = $(this).find('button[type="submit"]').data('parentid');
        // Get the ID of the part
        var partId = $(this).find('button[type="submit"]').data('partid');

        // Create a new series
        seriesAPI.createSeries(appId, displayName, null, groupId, function(err, series) {
            if (err) {
                return utils.notification('Series not created.', 'The series could not be successfully created.', 'error');
            }

            // Link the created series to the module
            orgunitAPI.addOrgUnitSeries(parentId, series.id, function(err) {
                if (err) {
                    return utils.notification('Series not created.', 'The series could not be successfully created.', 'error');
                }

                utils.notification('Series created.', 'The series was successfully created.', 'success');

                // Retrieve the organisational unit information for the modules
                orgUnitAPI.getOrgUnits(gh.data.me.AppId, true, null, partId, ['module'], function(err, modules) {
                    if (err) {
                        utils.notification('Fetching modules failed.', 'An error occurred while fetching the modules.', 'error');
                    }

                    // Track the user creating the series
                    gh.utils.trackEvent(['Manage', 'Add series', 'Completed'], {
                        'time_from_start': timeFromStart
                    });

                    // Refresh the modules list
                    $(document).trigger('gh.listview.refresh', {
                        'partId': partId,
                        'modules': modules
                    });

                    // Push the selected module and new series in the URL
                    var moduleId = parentId;
                    var seriesId = series.id;
                    gh.utils.addToState({
                        'module': moduleId,
                        'series': seriesId
                    });
                });
            });
        });

        return false;
    };

    /**
     * Toggle the enabled status of the button
     *
     * @api private
     */
    var toggleButton = function() {
        // Cache the text input
        var $this = $(this);
        // Cache the button
        var $button = $('#gh-create-series-submit');
        if (!$this.val().length) {
            return $button.attr('disabled', true);
        }
        $button.removeAttr('disabled');
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the new series view
     *
     * @private
     */
    var addBinding = function() {

        // Show the new series view
        $('body').on('click', '.gh-new-series', function() {
            // Fetch the group ID
            var groupId = $(this).data('groupid');
            // Feth the parent ID
            var parentId = $(this).closest('.list-group-item').data('id');
            // Fetch the part ID
            var partId = $(this).closest('#gh-modules-list-container').data('partid');
            // Dispatch an event to the admin view controller
            $(document).trigger('gh.admin.changeView', {
                'name': constants.views.NEW_SERIES,
                'data': {
                    'groupId': groupId,
                    'parentId': parentId,
                    'partId': partId
                }
            });
            // Track the user starting creation of a module
            gh.utils.trackEvent(['Manage', 'Add series', 'Started']);
            // Track how long the user takes to create the module
            timeFromStart = new Date();
        });

        // Toggle the enabled status of the submit button
        $('body').on('keyup', '#gh-series-name', toggleButton);

        // Create a new series
        $('body').on('submit', '#gh-new-series-form', createNewSeries);

        // Cancel creating a new series
        $('body').on('click', '#gh-create-series-cancel', cancelCreateNewSeries);
    };

    addBinding();
});
