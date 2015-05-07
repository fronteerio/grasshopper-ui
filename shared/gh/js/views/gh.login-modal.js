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


    //////////////////////
    //  AUTHENTICATION  //
    //////////////////////

    /**
     * Log in using the local authentication strategy
     *
     * @param  {Event}    ev    The jQuery event
     * @private
     */
    var doLogin = function(ev) {
        // Log in to the system if the form is valid and local authentication is enabled.
        // If Shibboleth is required the native form behaviour will be used and no extra
        // handling is required
        if (!ev.isDefaultPrevented() && gh.config.enableLocalAuth && !gh.config.enableShibbolethAuth) {
            // Collect and submit the form data
            var formValues = _.object(_.map($(this).serializeArray(), _.values));
            gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
                if (err) {
                    return gh.utils.notification('Could not sign you in', 'Please check that you are entering a correct username & password', 'error');
                }
                window.location.reload();
            });

            // Avoid default form submit behaviour
            return false;
        }
    };


    /////////////
    //  MODAL  //
    /////////////

    /**
     * Setup and show the login modal
     *
     * @param  {Object}    evt    The dispatched jQuery event
     * @param  {Object}    msg    The event message
     * @private
     */
    var setupAndShowModal = function(evt, msg) {

        // Render the login modal template
        gh.utils.renderTemplate('login-modal', {
            'data': {
                'gh': gh,
                'isGlobalAdminUI': false
            }
        }, $('#gh-modal'), function() {

            // Add logic once the modal is shown
            $('#gh-modal-login').on('shown.bs.modal', function() {

                // Track an event when the login modal is shown
                gh.utils.trackEvent(['Navigation', 'Authentication modal triggered']);

                // Bind the validator to the login form
                $('.modal-body .gh-signin-form').validator({
                    'disable': false
                }).on('submit', doLogin);
            });

            // Put the focus back on the trigger on hide
            $('#gh-modal-login').on('hidden.bs.modal', function() {
                if(msg && msg.data && msg.data.trigger) {
                    $(msg.data.trigger).focus();
                }
            });

            // Show the login modal
            $('#gh-modal-login').modal();
        });
    };


    ///////////////
    //  BINDING  //
    ///////////////

    /**
     * Add handlers for the login modal
     *
     * @private
     */
    var addBinding = function() {
        $(document).on('gh.login-modal.show', setupAndShowModal);
    };

    addBinding();
});
