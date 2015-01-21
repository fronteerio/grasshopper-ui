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

define(['gh.core', 'gh.subheader', 'gh.calendar', 'gh.admin-listview', 'clickover', 'jquery-bbq'], function(gh) {

    var state = $.bbq.getState() || {};

    // Cache the tripos data
    var triposData = {};


    /////////////////
    //  RENDERING  //
    /////////////////

    /**
     * Get the tripos structure from the REST API and filter it down for easy access in the templates
     *
     * @private
     */
    var getTripos = function() {

        // Fetch the triposes
        gh.api.utilAPI.getTriposStructure(function(err, data) {
            if (err) {
                return gh.api.utilAPI.notification('Fetching triposes failed.', 'An error occurred while fetching the triposes.', 'error');
            }

            // Cache the tripos data
            triposData = data;

            // Set up the tripos picker after all data has been retrieved
            // Initialise the subheader component after all data has been retrieved
            $(document).trigger('gh.subheader.init', {
                'triposData': triposData
            });
        });
    };

    /**
     * Get the user's triposes
     *
     * @private
     */
    var getUserTripos = function() {
        /* TODO: replace this by available parts for the admin */
        gh.api.utilAPI.renderTemplate($('#gh-main-tripos-template'), {
            'data': null
        }, $('#gh-main'));
    };

    /**
     * Render the header
     *
     * @private
     */
    var renderHeader = function() {
        gh.api.utilAPI.renderTemplate($('#gh-header-template'), {
            'gh': gh
        }, $('#gh-header'));
    };

    /**
     * Render the help section
     *
     * @private
     */
    var renderHelp = function() {
        gh.api.utilAPI.renderTemplate($('#gh-help-template'), {
            'gh': gh
        }, $('#gh-main'));
    };

    /**
     * Render the login form
     *
     * @private
     */
    var renderLoginForm = function() {
        $('#gh-subheader, #gh-content-description').height(350);
        gh.api.utilAPI.renderTemplate($('#gh-login-template'), {
            'gh': gh
        }, $('#gh-subheader'));
    };

    /**
     * Render the tripos pickers
     *
     * @private
     */
    var renderPickers = function() {
        gh.api.utilAPI.renderTemplate($('#gh-subheader-pickers-template'), {
            'gh': gh
        }, $('#gh-subheader'));
    };

    /**
     * Show the tripos help info
     *
     * @private
     */
    var showTriposHelp = function() {
        gh.api.utilAPI.renderTemplate($('#gh-tripos-help-template'), {
            'data': null
        }, $('#gh-modules-container'));
        $('.gh-tripos-help').show();
    };


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Log in using the local authentication strategy
     *
     * @param  {Event}    ev    The jQuery event
     * @private
     */
    var doLogin = function(ev) {

        // Prevent the form from being submitted
        ev.preventDefault();

        // Collect and submit the form data
        var formValues = _.object(_.map($(this).serializeArray(), _.values));
        gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
            if (!err) {
                window.location = '/admin';
            } else {
                gh.api.utilAPI.notification('Login failed', 'Logging in to the application failed', 'error');
            }
        });
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

        gh.api.authenticationAPI.logout(function(err) {
            if (!err) {
                window.location = '/admin';
            } else {
                gh.api.utilAPI.notification('Logout failed', 'Logging out of the application failed', 'error');
            }
        });
    };


    /////////////
    //  VIDEO  //
    /////////////

    /**
     * Initialise the video
     *
     * @private
     */
    var initVideo = function() {
        if (gh.api.utilAPI.localDataStorage().get('hideVideo')) {
            return hideVideo();
        }
        showVideo();

        // Do not show the video the next time
        gh.api.utilAPI.localDataStorage().store('hideVideo', true);
    };

    /**
     * Hide the help video
     *
     * @private
     */
    var hideVideo = function() {
        $('.gh-video').hide();
        $('.gh-show-video').show();
        return false;
    };

    /**
     * Show the help video
     *
     * @private
     */
    var showVideo = function() {
        $('.gh-video').show();
        $('.gh-show-video').hide();
        return false;
    };

    /**
     * Play the help video
     *
     * @private
     */
    var playVideo = function() {
        return false;
    };


    //////////////////////
    //  INITIALISATION  //
    //////////////////////

    /**
     * Add bindings to various elements on the page
     *
     * @private
     */
    var addBinding = function() {

        // Video events
        $('body').on('click', '.gh-show-video', showVideo);
        $('body').on('click', '.gh-hide-video', hideVideo);
        $('body').on('click', '.gh-play-video', playVideo);

        // Login and logout
        $('body').on('submit', '#gh-signin-form', doLogin);
        $('body').on('submit', '#gh-signout-form', doLogout);
    };

    /**
     * Initialise the page
     *
     * @private
     */
    var initIndex = function() {
        addBinding();
        renderHeader();

        // Display the login form if the user is not authenticated
        if (gh.data.me && gh.data.me.anon) {

            // Display the help link
            renderHelp();

            // Render the login form
            renderLoginForm();
        } else {

            // Render the picker container
            renderPickers();

            // Fetch all the triposes
            getTripos();

            // Fetch the user's triposes
            getUserTripos();

            // Show the tripos help info
            showTriposHelp();

            // Initialise the video
            initVideo();
        }
    };

    initIndex();
});
