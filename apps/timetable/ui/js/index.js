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

define(['gh.core', 'gh.subheader', 'gh.calendar', 'gh.student-listview'], function(gh) {

    // Cache the tripos data
    var triposData = {};


    /////////////////
    //  RENDERING  //
    /////////////////

    /**
     * Set up the header component by rendering the header and login templates, fetching the tripos
     * structure and initialising the subheader component
     *
     * @private
     */
    var setUpHeader = function() {
        // Render the header template
        gh.utils.renderTemplate($('#gh-header-template'), {
            'gh': gh
        }, $('#gh-header'));

        // Render the tripos pickers
        gh.utils.renderTemplate($('#gh-subheader-pickers-template'), {
            'gh': gh
        }, $('#gh-subheader'));

        // Set up the tripos picker after all data has been retrieved
        // Initialise the subheader component after all data has been retrieved
        $(document).trigger('gh.subheader.init', {
            'triposData': triposData
        });
    };

    /**
     * Render the calendar view
     *
     * @private
     */
    var setUpCalendar = function() {
        // Render the calendar template
        gh.utils.renderTemplate($('#gh-calendar-template'), {
            'data': {
                'gh': gh
            }
        }, $('#gh-main'));

        // Initialise the calendar
        $(document).trigger('gh.calendar.init', {'triposData': triposData});

        // Fetch the user's events
        if (!gh.data.me.anon) {

            // Put the calendar on today's view
            $(document).trigger('gh.calendar.navigateToToday');
        }
    };

    /**
     * Render the login modal dialog used to prompt anonymous users to sign in
     *
     * @private
     */
    var renderLoginModal = function() {
        gh.utils.renderTemplate($('#gh-modal-template'), {
            'gh': gh
        }, $('#gh-modal'));
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

        // Do local authentication
        if (gh.config.enableLocalAuth) {

            // Collect and submit the form data
            var formValues = _.object(_.map($(this).serializeArray(), _.values));
            gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
                if (!err) {
                    var state = $.param(History.getState().data);
                    if (state) {
                        return window.location.reload();
                    }
                    window.location = '/';
                } else {
                    gh.utils.notification('Login failed', 'Logging in to the application failed', 'error');
                }
            });

        // Do Shibboleth authentication
        } else if (gh.config.enableShibbolethAuth) {
            gh.api.authenticationAPI.shibbolethLogin();
        }
    };

    /**
     * Fetch the tripos data
     *
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var fetchTriposData = function(callback) {
        // Fetch the triposes
        gh.utils.getTriposStructure(function(err, data) {
            if (err) {
                return gh.utils.notification('Fetching triposes failed.', 'An error occurred while fetching the triposes.', 'error');
            }

            // Cache the tripos data
            triposData = data;

            return callback();
        });
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
        $('body').on('submit', '#gh-signin-form', doLogin);

        $(document).on('gh.calendar.ready', function() {
            setUpCalendar();
        });
    };

    /**
     * Initialise the page
     *
     * @private
     */
    var setUpIndex = function() {
        addBinding();

        // Fetch the tripos data before initialising the header and the calendar
        fetchTriposData(function() {
            setUpHeader();
            setUpCalendar();
            renderLoginModal();
        });
    };

    setUpIndex();
});
