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

define(['gh.core', 'gh.constants', 'marked'], function(gh, constants, marked) {

    /**
     * Accept the terms and conditions
     *
     * @private
     */
    var acceptTermsAndConditions = function() {
        // Accept the terms and conditions
        gh.api.userAPI.acceptTermsAndConditions(gh.data.me.id, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not accept the terms and conditions', constants.messaging.default.error, 'error');
            }

            // Close the modal window
            $('#gh-terms-and-conditions-modal').modal('hide');
        });
    };

    /**
     * Close the terms and conditions
     *
     * @private
     */
    var closeTermsAndConditions = function() {
        // Sign out of the application
        gh.api.authenticationAPI.logout(function(err) {
            if (err) {
                return gh.utils.notification('Could not sign out', constants.messaging.default.error, 'error');
            }

            // Redirect the user to the landing page
            window.location = '/';
        });
    };

    /**
     * Check the terms and conditions
     *
     * @private
     */
    var checkTermsAndConditions = function() {
        if (gh.data.me.termsAndConditions.needsToAccept) {
            return setupTermsAndConditionsModal();
        }
    };

    /**
     * Set up and display the terms and conditions modal
     *
     * @private
     */
    var setupTermsAndConditionsModal = function() {
        gh.api.appAPI.getTermsAndConditions(gh.config.AppId, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not fetch terms and conditions', constants.messaging.default.error, 'error');
            }

            // Convert the markdown to html
            var termsAndConditionsText = marked(data.text, {
                'breaks': true,
                'gfm': true,
                'sanitize': true
            });

            // Render the modal
            gh.utils.renderTemplate('student-terms-and-conditions-modal', {
                'data': {
                    'termsAndConditionsText': termsAndConditionsText
                }
            }, $('#gh-modal'), function() {

                setTimeout(function() {
                    // Show the modal
                    $('#gh-terms-and-conditions-modal').modal();
                }, 500);
            });
        });
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add binding to various elements on the page
     *
     * @private
     */
    var addBinding = function() {
        // Accept the terms and conditions
        $('body').on('click', '#gh-accept-terms-and-conditions', acceptTermsAndConditions);
        // Close the terms and conditions
        $('body').on('click', '#gh-close-terms-and-conditions', closeTermsAndConditions);
    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    var initialise = function() {

        // Add binding to various elements on the page
        addBinding();

        // Check whether the terms and conditions need to be accepted
        checkTermsAndConditions();
    };

    initialise();
});
