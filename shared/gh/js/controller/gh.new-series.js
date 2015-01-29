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

define(['gh.core', 'gh.admin-constants', 'gh.api.orgunit', 'gh.api.series', 'gh.api.util'], function(gh, adminConstants, orgunitAPI, seriesAPI, utilAPI) {

    /**
     * Create a new series
     *
     * @private
     */
    var createNewSeries = function() {

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
                return utilAPI.notification('Series not created.', 'The series could not be successfully created.', 'error');
            }

            // Link the created series to the module
            orgunitAPI.addOrgUnitSeries(parentId, series.id, function(err) {
                if (err) {
                    return utilAPI.notification('Series not created.', 'The series could not be successfully created.', 'error');
                }
                utilAPI.notification('Series created.', 'The series was successfully created.', 'success');

                // Create a new state object that will take care of opening the new series for us
                var state = $.bbq.getState();
                state.module = parentId;
                state.series = series.id;
                $.bbq.pushState(state);
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
                'name': adminConstants.views.NEW_SERIES,
                'data': {
                    'groupId': groupId,
                    'parentId': parentId,
                    'partId': partId
                }
            });
        });

        // Cancel creating a new series
        $('body').on('click', '#gh-create-series-cancel', function() {
            $(document).trigger('gh.admin.changeView', {'name': adminConstants.views.EDITABLE_PARTS});
        });

        // Toggle the enabled status of the submit button
        $('body').on('keyup', '#gh-series-name', toggleButton);

        // Create a new series
        $('body').on('submit', '#gh-new-series-form', createNewSeries);
    };

    addBinding();
});
