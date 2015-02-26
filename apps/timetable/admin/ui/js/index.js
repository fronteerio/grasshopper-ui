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

define(['gh.core', 'gh.constants', 'gh.admin-listview', 'gh.admin-batch-edit', 'gh.calendar', 'gh.subheader', 'gh.video', 'clickover', 'jquery-bbq', 'jquery.jeditable'], function(gh, constants) {
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
    var getTriposData = function() {

        // Fetch the triposes
        gh.utils.getTriposStructure(function(err, data) {
            if (err) {
                return gh.utils.notification('Fetching triposes failed.', 'An error occurred while fetching the triposes.', 'error');
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
     * Render the header
     *
     * @private
     */
    var renderHeader = function() {
        gh.utils.renderTemplate($('#gh-header-template'), {
            'gh': gh
        }, $('#gh-header'));
    };

    /**
     * Render the help section
     *
     * @private
     */
    var renderHelp = function() {
        gh.utils.renderTemplate($('#gh-help-template'), {
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
        gh.utils.renderTemplate($('#gh-login-template'), {
            'gh': gh
        }, $('#gh-subheader'));
    };

    /**
     * Render the tripos pickers
     *
     * @private
     */
    var renderPickers = function() {
        gh.utils.renderTemplate($('#gh-subheader-pickers-template'), {
            'gh': gh
        }, $('#gh-subheader'));
    };

    /**
     * Render the editable parts for the user
     *
     * @private
     */
    var renderEditableParts = function() {
        var editableParts = [];
        // Create an entry for each course. If the course has a subject, include the subject
        _.each(triposData.courses, function(course) {
            // Get the subjects that are children of the course
            var subjects = _.filter(triposData.subjects, function(subject) {
                return course.id === subject.ParentId;
            });

            // If there subjects for the course the data object needs to be slightly different
            if (subjects.length) {
                // Loop over all subjects
                _.each(subjects, function(subject) {
                    // Get the parts that are children of the subject
                    var parts = _.filter(triposData.parts, function(part) {
                        return subject.id === part.ParentId;
                    });

                    // For all parts that are children of the subject, create an object and push
                    // it into the Array
                    _.each(parts, function(part) {
                        editableParts.push({
                            'displayName': course.displayName + ' - ' + subject.displayName,
                            'hash': '#tripos=' + subject.id + '&part=' + part.id,
                            'canManage': course.canManage,
                            'part': part,
                            'isEditing': part.Group.LockedBy || false,
                            'isDraft': part.published
                        });
                    });
                });
            } else {
                // There are no subjects and children parts are attached to the course parent
                // Get all the parts that are children of the course
                var parts = _.filter(triposData.parts, function(part) {
                    return course.id === part.ParentId;
                });

                // For all parts that are children of the course, create an object and push
                // it into the Array
                _.each(parts, function(part) {
                    editableParts.push({
                        'displayName': course.displayName,
                        'hash': '#tripos=' + course.id + '&part=' + part.id,
                        'canManage': course.canManage,
                        'part': part,
                        'isEditing': part.Group.LockedBy || false,
                        'isDraft': part.published
                    });
                });
            }
        });

        // Render the editable parts template
        gh.utils.renderTemplate($('#gh-editable-parts-template'), {
            'data': editableParts,
            'gh': gh,
            'hideVideo': gh.utils.localDataStorage().get('hideVideo')
        }, $('#gh-main'));
    };

    /**
     * Show the new series form
     *
     * @param  {Object}    data    Object containing template data
     * @private
     */
    var renderNewSeriesForm = function(data) {
        gh.utils.renderTemplate($('#gh-new-series-template'), {
            'gh': gh,
            'data': data
        }, $('#gh-main'));
    };

    /**
     * Show the batch edit form
     *
     * @param  {Object}    data    Object containing template data
     * @private
     */
    var renderBatchEdit = function(data) {
        // Split the events by term
        data.eventsByTerm = gh.utils.splitEventsByTerm(data.events);
        // Delete the events object as it's been parsed into a different object
        delete data.events;
        // Order the events and split up the out of term events
        data.eventsByTerm = gh.utils.orderEventsByTerm(data.eventsByTerm);
        // Render the batch edit template
        gh.utils.renderTemplate($('#gh-batch-edit-template'), {
            'gh': gh,
            'data': data
        }, $('#gh-main'));

        // Let the batch-edit plugin know that the HTML has been rendered
        $(document).trigger('gh.batchedit.rendered');
    };

    /**
     * Show the tripos help info
     *
     * @private
     */
    var showTriposHelp = function() {
        gh.utils.renderTemplate($('#gh-tripos-help-template'), null, $('#gh-modules-container'));
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

        // Do local authentication
        if (gh.config.enableLocalAuth) {

            // Collect and submit the form data
            var formValues = _.object(_.map($(this).serializeArray(), _.values));
            gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
                if (!err) {
                    window.location = '/admin';
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
                gh.utils.notification('Logout failed', 'Logging out of the application failed', 'error');
            }
        });
    };


    /////////////
    //  VIDEO  //
    /////////////

    /**
     * Hide the help video
     *
     * @private
     */
    var hideVideo = function() {
        // Show the video in the list
        $('#gh-main-tripos .gh-video').show();
        // Hide the video on the top
        $('#gh-main-tripos .gh-video:first-child').hide();
        // Do not show the video next time
        gh.utils.localDataStorage().store('hideVideo', true);
        // Stop the video
        $(document).trigger('gh.video.stop');
    };

    /**
     * Show the help video
     *
     * @private
     */
    var showVideo = function() {
        // Hide the video in the list
        $('#gh-main-tripos .gh-video').hide();
        // Show the video on the top
        $('#gh-main-tripos > .gh-video').show();
        // Scroll to the top to see the video
        $('body').animate({scrollTop: 0}, 200);
        // Start the video
        $(document).trigger('gh.video.play');
    };

    /**
     * Play the help video
     *
     * @private
     */
    var playVideo = function() {
        showVideo();
        return false;
    };


    /////////////
    //  VIEWS  //
    /////////////

    /**
     * Handle the view changed event
     *
     * @param  {Event}     ev           The dispatched jQuery event
     * @param  {Object}    data         The event message object
     * @param  {String}    data.name    The name of the view
     * @param  {Object}    data.data    Object containing template data
     * @private
     */
    var onViewChange = function(ev, data) {
        setView(data.name, data.data);
    };

    /**
     * Change the current view
     *
     * @param  {String}    view    The name of the view that needs to be displayed
     * @param  {Object}    data    Object containing template data
     * @private
     */
    var setView = function(view, data) {
        switch(view) {
            case constants.views.NEW_SERIES:
                renderNewSeriesForm(data);
                break;
            case constants.views.BATCH_EDIT:
                renderBatchEdit(data);
                break;
            // Show the editable parts for the admin by default
            default:
                renderEditableParts();
                break;
        }
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
        $('body').on('click', '.gh-hide-video', hideVideo);
        $('body').on('click', '.gh-play-video', playVideo);

        // Login and logout
        $('body').on('submit', '#gh-signin-form', doLogin);
        $('body').on('submit', '#gh-signout-form', doLogout);

        // Change the view
        $(document).on('gh.admin.changeView', onViewChange);

        // Refresh the tripos data
        $(document).on('gh.triposdata.refresh', getTriposData);
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
            // Only show the login form is local authentication is enabled
            if (gh.config.enableLocalAuth) {

                // Display the help link
                renderHelp();

                // Render the login form
                renderLoginForm();
            }
        } else {

            // Render the picker container
            renderPickers();

            // Fetch all the triposes
            getTriposData();

            // Show the tripos help info
            showTriposHelp();
        }
    };

    initIndex();
});
