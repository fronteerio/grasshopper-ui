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

define(['gh.core', 'gh.subheader', 'gh.calendar', 'gh.student-listview', 'jquery-bbq'], function(gh) {

    var state = $.bbq.getState() || {};

    // Cache the tripos data
    var triposData = {};


    /////////////////
    //  RENDERING  //
    /////////////////

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
     * Render the login modal
     *
     * @private
     */
    var renderLoginModal = function() {
         gh.api.utilAPI.renderTemplate($('#gh-modal-template'), {
            'gh': gh
        }, $('#gh-modal'));
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
     * Render the calendar view
     *
     * @private
     */
    var setUpCalendar = function() {
        gh.api.utilAPI.renderTemplate($('#gh-calendar-template'), {
            'data': null
        }, $('#gh-main'));

        if (gh.data.me.anon) {
            $(document).trigger('gh.calendar.init');
        } else {
            var range = gh.api.utilAPI.getCalendarDateRange();
            gh.api.userAPI.getUserCalendar(gh.data.me.id, range.start, range.end, function(err, data) {
                if (err) {
                    gh.api.utilAPI.notification('Fetching user calendar failed.', 'An error occurred while fetching the user calendar.', 'error');
                }

                var calendarData = {
                    'triposData': triposData,
                    'events': data
                };

                $(document).trigger('gh.calendar.init', calendarData);
            });
        }
    };

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
                var state = $.param($.bbq.getState());
                if (state) {
                    return window.location.reload();
                }
                window.location = '/';
            } else {
                gh.api.utilAPI.notification('Login failed', 'Logging in to the application failed', 'error');
            }
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
    var initIndex = function() {
        addBinding();
        renderHeader();
        renderPickers();
        renderLoginModal();
        setUpCalendar();
        getTripos();
    };

    initIndex();
});
