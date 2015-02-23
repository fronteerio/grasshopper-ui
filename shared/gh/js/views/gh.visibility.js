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
     * Render and show the 'visibility' modal dialog
     *
     * @private
     */
    var showVisibilityModal = function() {
        // Render the modal
        gh.utils.renderTemplate($('#gh-visibility-modal-template'), {'data': {
            // TODO: make this dynamic once the functionality is available in the back-end
            'visibility': 'draft'
        }}, $('#gh-visibility-modal-container'));
        // Show the modal
        $('#gh-visibility-modal').modal();
    };

    /**
     * Update the visibility status
     *
     * @private
     */
    var updateVisibilityStatus = function() {
        // TODO: Incorporate when back-end functionality has been implemented
        return false;
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
        // Change the visibility mode
        $('body').on('change', '#gh-visibility-form input[type="radio"]', selectVisibilityType);
        // Update the visibility status
        $('body').on('click', '#gh-visibility-save', updateVisibilityStatus);
        // Toggle the modal
        $('body').on('click', '.gh-visibility', showVisibilityModal);
    };

    addBinding();
});
