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

define(['gh.core', 'jquery.placeholder', 'validator'], function(gh) {


    //////////////////////
    //  AUTHENTICATION  //
    //////////////////////

    /**
     * Log in using the local authentication strategy
     *
     * @param  {Event}      ev    The jQuery event
     * @return {Boolean}          Return false to avoid the default form behaviour
     * @private
     */
    var doLogin = function(ev) {

        // Determine whether or not the global admin is in use
        var isGlobalAdminUI = $('body').hasClass('gh-global-admin');

        // Log in to the system if the form is valid and local authentication is enabled.
        // If Shibboleth is required the native form behaviour will be used and no extra
        // handling is required
        if (!ev.isDefaultPrevented() && (isGlobalAdminUI || (gh.config.enableLocalAuth && !gh.config.enableShibbolethAuth))) {
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

    /**
     * Log the current user out
     *
     * @param  {Event}    ev    The jQuery event
     * @private
     */
    var doLogout = function(ev) {
        // Prevent the form from being submitted
        ev.preventDefault();
        // Sign out the user
        gh.api.authenticationAPI.logout(function(err) {
            if (err) {
                return gh.utils.notification('Logout failed', 'Logging out of the application failed', 'error');
            }
            window.location = '/';
        });
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements
     *
     * @private
     */
    var addBinding = function() {
        // Sign out the user when the form is submitted
        $('body').on('submit', '#gh-signout-form', doLogout);
        // Bind the validator to the login form when it becomes available
        $('body').on('submit', '.gh-signin-form', doLogin).validator({'disable': false});
    };


    //////////////////////
    //  INITIALISATION  //
    //////////////////////

    /**
     * Set up components
     *
     * @private
     */
    var setupComponents = function() {

        // Add placeholders to the input fields (IE fix)
        $('.gh-signin-form').onAvailable(function() {
            $('#gh-signin-email').placeholder();
            $('#gh-signin-password').placeholder();
        });
    };

    /**
     * Initialise the login form
     *
     * @private
     */
    var initialise = function() {

        // Set up components in the login form
        setupComponents();

        // Add binding to various elements in the login form
        addBinding();
    };

    initialise();
});
