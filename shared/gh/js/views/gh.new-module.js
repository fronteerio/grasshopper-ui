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

define(['gh.core', 'gh.api.orgunit'], function(gh, orgUnitAPI) {

    /**
     * Create the module using the provided title
     *
     * @private
     */
    var createModule = function() {
        // Get the AppId
        var appId = require('gh.core').data.me.AppId;
        // Get the display name of the new module
        var displayName = $(this).find('#gh-module-title').val();
        // Get the ID of the part that this new module belongs to
        var partId = $(this).find('button[type="submit"]').data('partid');
        // Get the ID of the group that this new module belongs to
        var groupId = $(this).find('button[type="submit"]').data('groupid');

        orgUnitAPI.createOrgUnit(appId, displayName, 'module', partId, groupId, null, null, null,function(err, module) {
            // Show a success or failure notification
            if (err) {
                return gh.utils.notification('Module not created.', 'The module could not be successfully created.', 'error');
            }
            gh.utils.notification('Module created.', 'The module was successfully created.', 'success');

            // Hide the module modal
            $('#gh-new-module-modal').modal('hide');

            // Retrieve the organisational unit information for the modules
            orgUnitAPI.getOrgUnits(appId, true, null, partId, ['module'], function(err, modules) {
                if (err) {
                    utils.notification('Fetching modules failed.', 'An error occurred while fetching the modules.', 'error');
                }

                // Refresh the modules list
                $(document).trigger('gh.listview.refresh', {
                    'partId': partId,
                    'modules': modules
                });
            });
        });

        return false;
    };

    /**
     * Render and show the 'new module' modal dialog
     *
     * @private
     */
    var showNewModuleModal = function() {
        // Render the modal
        gh.utils.renderTemplate($('#gh-new-module-modal-template'), {
            'partId': $(this).data('partid'),
            'groupId': $(this).data('groupid')
        }, $('#gh-new-module-modal-container'));
        // Show the modal
        $('#gh-new-module-modal').modal();
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the new module modal
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('click', '.gh-new-module', showNewModuleModal);
        $('body').on('submit', '#gh-new-module-form', createModule);
    };

    addBinding();
});
