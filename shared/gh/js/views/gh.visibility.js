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

define(['gh.core'], function(gh) {


    /////////////
    //  MODAL  //
    /////////////

    /**
     * Highlight the selected visibility types
     *
     * @private
     */
    var selectVisibilityType = function() {
        $('.gh-visibility-label').removeClass('checked');
        $(this).parents('label').addClass('checked');
    };

    /**
     * Dismiss the 'visibility' modal dialog
     *
     * @private
     */
    var dismissVisibilityModal = function() {
        $('#gh-visibility-modal').modal('hide');
    };

    /**
     * Render and show the 'visibility' modal dialog
     *
     * @private
     */
    var showVisibilityModal = function() {
        // Cache the trigger
        var $trigger = $(this);
        // Retrieve the organisational unit ID
        var orgUnitId = parseInt($.bbq.getState().part, 10);

        // Retrieve the published status
        gh.api.orgunitAPI.getOrgUnit(orgUnitId, false, function(err, data) {
            if (err) {
                return gh.utils.notification('Request error.', 'An error occurred while requesting the unit information.', 'error');
            }

            // Render the modal
            gh.utils.renderTemplate($('#gh-visibility-modal-template'), {'data': {
                'published': data.published
            }}, $('#gh-visibility-modal-container'));

            // Show the modal
            $('#gh-visibility-modal').modal();
        });
    };

    /**
     * Update the visibility status
     *
     * @private
     */
    var updateVisibilityStatus = function() {
        // Retrieve the organisational unit ID
        var orgUnitId = parseInt($.bbq.getState().part, 10);
        // Retrieve the published status
        var published = $('#gh-visibility-modal').find('.gh-visibility-label.checked').data('published');

        // Update the published status for the organisational unit
        gh.api.orgunitAPI.updateOrgUnit(orgUnitId, null, null, null, null, null, null, published, function(err, orgUnit) {
            if (err) {
                return gh.utils.notification('Update error.', 'An error occurred while updating the published status.', 'error');
            }

            // Only show a notification when the draft has been published
            if (published) {
                gh.utils.notification('"' + orgUnit.displayName + '" has been published.', 'Students and Lecturers can now access the information in the timetable.');
            }

            // Render the visibility button
            renderVisibilityButton(orgUnit.id, orgUnit.published);

            // Trigger a refresh
            $(document).trigger('gh.triposdata.refresh');

            // Hide the modal
            return dismissVisibilityModal();
        });
    };


    //////////////
    //  BUTTON  //
    //////////////

    /**
     * Initialise the visibility button
     *
     * @param  {Event}     ev           Standard jQuery event
     * @param  {Object}    data         Data object containing the organisational unit
     * @param  {Number}    data.part    The ID of the organisational unit
     * @private
     */
    var initialiseVisibilityButton = function(ev, data) {
        if (data && data.part) {

            // Retrieve the published status
            gh.api.orgunitAPI.getOrgUnit(data.part, false, function(err, orgUnit) {
                if (err) {
                    return gh.utils.notification('Request error.', 'An error occurred while requesting the unit information.', 'error');
                }

                // Render the visibility button
                renderVisibilityButton(orgUnit.id, orgUnit.published);
            });
        } else {
            $('#gh-subheader-visibility').empty();
        }
    };

    /**
     * Render the visibility button
     *
     * @param  {Number}     id           The id of the organisational unit
     * @param  {Boolean}    published    Whether or not the unit has been published
     * @private
     */
    var renderVisibilityButton = function(id, published) {

        // Render the visibility button
        gh.utils.renderTemplate($('#gh-visibility-button-template'), {'data': {
            'id': id,
            'published': published
        }}, $('#gh-subheader-visibility'));
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add bindings to various elements in the visibility component
     *
     * @private
     */
    var addBinding = function() {
        // Initialise the visibility button
        $(document).on('gh.part.changed', initialiseVisibilityButton);
        // Change the visibility mode
        $('body').on('change', '#gh-visibility-form input[type="radio"]', selectVisibilityType);
        // Update the visibility status
        $('body').on('click', '#gh-visibility-save', updateVisibilityStatus);
        // Toggle the modal
        $('body').on('click', '.gh-visibility', showVisibilityModal);
    };

    addBinding();
});
