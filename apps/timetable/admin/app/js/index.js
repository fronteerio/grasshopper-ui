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

define(['gh.core', 'gh.constants', 'gh.footer', 'gh.header', 'gh.admin.manage-orgunits', 'jquery-autosuggest', 'validator'], function(gh, constants) {

    // Get the current page, strip out slashes etc
    var currentPage = window.location.pathname.split('/')[2];


    /////////////////
    //  RENDERING  //
    /////////////////

    /**
     * Render the admin navigation
     *
     * @private
     */
    var renderNavigation = function() {
        gh.utils.renderTemplate('admin-app-navigation', {
            'gh': gh,
            'currentPage': currentPage
        }, $('#gh-navigation-container'));
    };

    /**
     * Render the login form
     *
     * @private
     */
    var renderLoginForm = function() {
        $('#gh-subheader, #gh-content-description').height(350);
        gh.utils.renderTemplate('admin-login-form', {
            'gh': gh
        }, $('#gh-subheader'));

        // Bind the validator to the login form
        $('.gh-signin-form').validator({
            'disable': false
        }).on('submit', doLogin);
    };

    /**
     * Render the app user search
     *
     * @private
     */
    var renderAppUserSearch = function() {
        gh.utils.renderTemplate('admin-app-user-search', null, $('#gh-main'), function() {
            // Set up user management
            setUpAutoSuggest();
        });
    };

    /**
     * Render the tripos structure indicating which groups the selected user is part of
     *
     * @param  {Object}    triposData     The app's tripos structure
     * @param  {User}      user           The user Object to render
     * @param  {Object}    memberships    The memberships of the user
     * @private
     */
    var renderUser = function(triposData, user, memberships) {
        gh.utils.renderTemplate('admin-app-user', {
            'gh': gh,
            'memberships': memberships.results,
            'triposData': triposData,
            'user': user
        }, $('#gh-app-user-container'));
    };

    /**
     * Render the app management form
     *
     * @private
     */
    var renderApp = function() {
        gh.utils.renderTemplate('admin-app', {
            'app': gh.data.me.app
        }, $('#gh-main'));
    };

    /**
     * Render the configuration form
     *
     * @param  {Object}    config    The app configuration object
     * @private
     */
    var renderConfig = function(config) {
        gh.utils.renderTemplate('admin-app-config', {
            'app': gh.data.me.app,
            'config': config,
            'gh': gh
        }, $('#gh-main'));
    };


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Update the value attribute of a checkbox and make sure all parent checkboxes are
     * in line with the checks that have been made
     *
     * @private
     */
    var updateCheckboxValue = function() {
        // Cache the checked value
        var checked = $(this).is(':checked');

        // Update the checkbox that changed
        $(this).val(checked);

        // Make sure any parents get updated as well. If the checkbox got
        // unchecked the parent will be unchecked as well
        if (!checked) {
            $($(this).parents('li')).slice(1).children('.checkbox').find('input').prop('checked', false);
        } else {
            var uncheckedSiblings = $($(this).parents('li')[0]).siblings().find('input:not(:checked)');
            // If any of the siblings are unchecked, uncheck the parents
            if (uncheckedSiblings && uncheckedSiblings.length) {
                $($(this).parents('li')).slice(1).children('.checkbox').find('input').prop('checked', false);
            // If no siblings are unchecked, check their parent and fire the change event on them so that the checks
            // proppagate to the top
            } else {
                $($(this).parents('li')).slice(1, 2).children('.checkbox').find('input').prop('checked', true).change();
            }
        }
    };

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
            if (err) {
                return gh.utils.notification('Logout failed', 'Logging out of the application failed', 'error');
            }
            window.location = '/admin/users';
        });
    };


    ///////////////////
    // CONFIGURATION //
    ///////////////////

    /**
     * Submit the configuration form and save the values
     *
     * @return {Boolean}    Avoid default form submit behaviour
     * @private
     */
    var updateConfiguration = function() {
        var $form = $(this);

        // Serialise the form values into an object that can be sent to the server
        var configValues = _.object(_.map($form.serializeArray(), _.values));

        // Standards say that unchecked checkboxes shouldn't be sent over to the server. Too bad, we need to add them
        // in explicitely as config values might have changed.
        _.each($('[type="checkbox"]:not(:checked)', $form), function(chk) {
            configValues[$(chk).attr('name')] = $(chk).is(':checked');
        });

        // Update the configuration
        gh.api.configAPI.updateConfig($form.data('appid'), configValues, function(err) {
            if (err) {
                return gh.utils.notification('App configuration not updated', constants.messaging.default.error, 'error');
            }
            gh.utils.notification('App configuration updated', null, 'success');
            // Send a tracking event
            gh.utils.trackEvent(['Manage', 'Config', 'Updated'], {
                'app': $form.data('appid')
            });
        });

        // Avoid default form submit behaviour
        return false;
    };


    /////////////
    // COURSES //
    /////////////

    /**
     * Render the courses configuration page
     *
     * @private
     */
    var renderCourses = function() {
        gh.utils.getTriposStructure(gh.data.me.AppId, false, function(err, orgUnitTypes) {
            // Show the manage orgunits view
            gh.utils.renderTemplate('admin-manage-orgunits', {
                'triposData': orgUnitTypes
            }, $('#gh-main'), function() {
                $(document).trigger('gh.manage.orgunits.loaded');
            });
        });
    };


    /////////
    // APP //
    /////////

    /**
     * Update an existing application
     *
     * @return {Boolean}    Return false to avoid default form submit behaviour
     * @private
     */
    var updateApp = function() {
        // Get the ID of the app that's being updated
        var appId = parseInt($(this).data('appid'), 10);

        // Get the updated values
        var displayName = $('.gh-app-displayname', $(this)).val();
        var enabled = $('.gh-app-enabled', $(this)).is(':checked');
        var host = $('.gh-app-host', $(this)).val();

        // Update the app
        gh.api.appAPI.updateApp(appId, displayName, enabled, host, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not update the system app', constants.messaging.default.error, 'error');
            }
            gh.utils.notification('System app ' + displayName + ' successfully updated', null, 'success');
            // Send a tracking event
            gh.utils.trackEvent(['Manage', 'App', 'Updated'], {
                'app': appId
            });
        });

        // Avoid default form submit behaviour
        return false;
    };


    ///////////
    // USERS //
    ///////////

    /**
     * Get the user object from the user AutoSuggest field
     *
     * @return {User}    User object chosen in the user AutoSuggest field
     * @private
     */
    var getUserSelection = function() {
        // Used to store the user information
        var batchSelection = [];

        // Get the user object
        $user = $('.as-selection-item');

        // Return the Array of user objects
        return {
            'id': parseInt($user.data('value').toString(), 10),
            'displayName': $user.text().slice(1)
        };
    };

    /**
     * Submit the form with parts the user has access to
     *
     * @return {Boolean}    Return false to avoid the default form submit behaviour
     * @private
     */
    var submitPartForm = function() {
        var groups = $(this).find('[data-groupid]');
        // Get the changes
        var changeSet = _.compact(_.map(groups, function(group) {
            var originalValue = JSON.parse($(group).data('original'));
            var newValue = JSON.parse($(group).is(':checked'));

            // Only return the change when there is one
            if (originalValue !== newValue) {
                return {
                    'checked': newValue,
                    'id': $(group).data('groupid')
                };
            }
        }));

        var todo = changeSet.length;
        var done = 0;

        /**
         * Update the members of a group
         *
         * @param  {Object}      change      Object containing the change in group membership for a user
         * @param  {Function}    callback    Standard callback function
         * @private
         */
        var updateGroupMember = function(change, callback) {
            // Get the user object
            var user = getUserSelection();
            // Construct the change object to send to the server
            var changeObj = {};
            changeObj[user.id] = change.checked;

            // Update the user's access to the part
            gh.api.groupsAPI.updateGroupMembers(change.id, changeObj, function(err) {
                if (err) {
                    return gh.utils.notification('Could not update user access', constants.messaging.default.error, 'error');
                }

                done++;
                if (done === todo) {
                    return callback();
                }

                updateGroupMember(changeSet[done], callback);
            });
        };

        // Only submit changes when there are any
        if (changeSet.length) {
            updateGroupMember(changeSet[0], function() {
                gh.utils.notification('User access updated', 'The user\'s access to parts has been updated successfully', 'success');
                getTriposStructure();
                // Send a tracking event
                gh.utils.trackEvent(['Manage', 'Users', 'Group membership updated'], {
                    'user': getUserSelection().id
                });
            });
        }

        // Avoid the default form submit behaviour
        return false;
    };

    /**
     * Get the app's tripos structure
     *
     * @private
     */
    var getTriposStructure = function() {
        var appId = parseInt(require('gh.core').data.me.AppId, 10);

        // Get the tripos structure
        gh.utils.getTriposStructure(appId, true, function(triposErr, triposData) {
            if (triposErr) {
                return gh.utils.notification('Could not get the application\'s tripos structure', constants.messaging.default.error, 'error');
            }

            // Get the profile of the selected user
            gh.api.userAPI.getUser(getUserSelection().id, function(userErr, user) {
                if (userErr) {
                    return gh.utils.notification('Could not get the selected user\'s profile', constants.messaging.default.error, 'error');
                }

                // Get the groups the user is a member of
                gh.api.userAPI.getUserMemberships(user.id, triposData.parts.length, null, function(membershipErr, memberships) {
                    if (membershipErr) {
                        return gh.utils.notification('Could not get the user\'s memberships', constants.messaging.default.error, 'error');
                    }

                    // Render the user profile and part permissions
                    renderUser(triposData, user, memberships);
                });
            });
        });
    };

    /**
     * Update an application user
     *
     * @return {Boolean}    Return false to avoid default form submit behaviour
     * @private
     */
    var updateUser = function() {
        // Cache the form object
        var $form = $(this);
        // Get the administrator's userId and display name
        var userId = parseInt($form.data('userid'), 10);
        var displayName = $('.gh-user-displayname', $form).val();
        var email = $('.gh-user-email', $form).val();
        var emailPreference = 'no';
        var password = $('.gh-user-password', $form).val();
        var isAdmin = $('.gh-user-isadmin', $form).is(':checked');

        // Update the user
        gh.api.userAPI.updateUser(userId, displayName, email, emailPreference, function(updateErr) {
            if (updateErr) {
                return gh.utils.notification('Administrator ' + displayName + ' could not be updated', constants.messaging.default.error, 'error');
            }

            // Promote/demote the user
            gh.api.userAPI.updateAdminStatus(userId, isAdmin, function(adminStatusErr) {
                if (adminStatusErr) {
                    return gh.utils.notification('Administrator ' + displayName + ' could not be updated', constants.messaging.default.error, 'error');
                }

                // Update the user display
                getTriposStructure();
                // Show a success message
                gh.utils.notification('Administrator ' + displayName + ' successfully updated', null, 'success');
                // Send a tracking event
                gh.utils.trackEvent(['Manage', 'Users', 'Updated'], {
                    'user': userId
                });
            });
        });

        // Avoid default form submit behaviour
        return false;
    };


    //////////////////////
    //  INITIALISATION  //
    //////////////////////

    /**
     * Set up the configuration page
     *
     * @private
     */
    var setUpConfig = function() {
        gh.api.configAPI.getConfig(gh.data.me.app.id, function(err, config) {
            // Remove unwanted properties from the configuration object
            delete config.createdAt;
            delete config.updatedAt;

            // Render the configuration
            renderConfig(config);

            // Send a tracking event
            gh.utils.trackEvent(['Manage', 'Config', 'Opened']);
        });
    };

    /**
     * Set up courses page
     *
     * @private
     */
    var setUpCourses = function() {
        renderCourses();
        // Send a tracking event
        gh.utils.trackEvent(['Manage', 'App', 'Opened']);
    };

    /**
     * Set up the app page
     *
     * @private
     */
    var setUpApp = function() {
        renderApp();
        // Send a tracking event
        gh.utils.trackEvent(['Manage', 'App', 'Opened']);
    };

    /**
     * Set up the users page
     *
     * @private
     */
    var setUpUsers = function() {
        // Render the app user search
        renderAppUserSearch();
        // Send a tracking event
        gh.utils.trackEvent(['Manage', 'Users', 'Opened']);
    };

    /**
     * Set up the user search AutoSuggest
     *
     * @private
     */
    var setUpAutoSuggest = function() {
        $('#gh-app-user-search').autoSuggest('/api/users', {
            'limitText': 'Only one user can be edited at a time',
            'minChars': 2,
            'neverSubmit': true,
            'retrieveLimit': 10,
            'url': '/api/users',
            'searchObjProps': 'id, displayName',
            'selectedItemProp': 'displayName',
            'selectedValuesProp': 'id',
            'selectionLimit': 1,
            'startText': 'Search user',
            'usePlaceholder': true,
            'retrieveComplete': function(data) {
                // Append the shibbolethId to the displayName to make it easier to distinguish between users
                _.each(data.results, function(user) {
                    var suffix = user.shibbolethId ? ' (' + user.shibbolethId + ')' : '';
                    user.displayName = user.displayName + suffix;
                });
                // Send a tracking event
                gh.utils.trackEvent(['Manage', 'Users', 'Searched user'], {
                    'query': $('.as-input').val(),
                });
                return data.results;
            },
            'selectionAdded': function(element, userId) {
                if (!_.isNumber(userId)) {
                    $(element).find('.as-close').click();
                } else {
                    getTriposStructure();
                }
                // Send a tracking event
                gh.utils.trackEvent(['Manage', 'Users', 'Selected user'], {
                    'user': userId,
                });
            },
            'selectionRemoved': function(elem) {
                // Remove the previously selected user from the AutoSuggest
                elem.remove();
                // Empty the user management container
                $('#gh-app-user-container').empty();
            }
        });
    };

    /**
     * Add event handlers to various elements on the page
     *
     * @private
     */
    var addBinding = function() {
        // Render the courses
        $(document).on('gh.manage.orgunits.load', renderCourses);

        // Log out
        $('body').on('submit', '#gh-signout-form', doLogout);

        // Update the value attribute of a checkbox when it changes
        $('body').on('change', 'input[type="checkbox"]', updateCheckboxValue);

        // Select/deselect all parts when a subject is checked/unchecked
        $('body').on('change', '.gh-user-tripos-course-checkbox, .gh-user-tripos-subject-checkbox', function() {
            var checked = $(this).is(':checked');
            var selector = '.gh-user-tripos-part-checkbox:not(:checked)';
            if (!checked) {
                selector = '.gh-user-tripos-part-checkbox:checked';
            }
            $(this).closest('li').find(selector).click();
        });

        // Submit the group permissions form
        $('body').on('submit', '#gh-user-permissions-form', submitPartForm);

        // Update user
        $('body').on('submit', '.gh-app-user-update-form', updateUser);

        // Update app
        $('body').on('submit', '.gh-app-update-form', updateApp);

        // Update configuration
        $('body').on('submit', '.gh-configuration-form', updateConfiguration);
    };

    /**
     * Initialise the page
     *
     * @private
     */
    var initIndex = function() {
        // Display the login form if the user is not authenticated
        if (gh.data.me && !gh.data.me.anon && !gh.data.me.isAdmin) {
            gh.utils.redirect().accessdenied();
        } else if (gh.data.me && gh.data.me.anon) {
            // Show the body as we're allowed access
            $('body').show();

            // Add event handlers
            addBinding();

            // Set up the header
            $(document).trigger('gh.header.init', {
                'isGlobalAdminUI': true
            });

            // Set up the page footer
            $(document).trigger('gh.footer.init');

            // Only show the login form is local authentication is enabled and shibboleth is disabled
            if (gh.config.enableLocalAuth && !gh.config.enableShibbolethAuth) {

                // Render the login form
                renderLoginForm();
            }
        } else {
            // Add event handlers
            addBinding();

            // Set up the header
            $(document).trigger('gh.header.init', {
                'isGlobalAdminUI': true
            });

            // Set up the page footer
            $(document).trigger('gh.footer.init');

            // Show the body as we're allowed access
            $('body').show();

            // Show the page content
            $('#gh-main').show();

            // Show the right content, depending on the page the user's on
            if (currentPage === 'configuration') {
                setUpConfig();
            } else if (currentPage === 'app') {
                setUpApp();
            } else if (currentPage === 'users') {
                setUpUsers();
            } else if (currentPage === 'courses') {
                setUpCourses();
            } else {
                currentPage = 'users';
                setUpUsers();
            }

            // Render the navigation
            renderNavigation();
        }
    };

    initIndex();
});
