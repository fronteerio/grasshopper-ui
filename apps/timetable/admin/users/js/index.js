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

define(['gh.core', 'gh.constants', 'jquery-autosuggest', 'validator'], function(gh, constants) {


    /////////////////
    //  RENDERING  //
    /////////////////

    /**
     * Render the header
     *
     * @private
     */
    var renderHeader = function() {
        gh.utils.renderTemplate($('#gh-header-template'), {
            'data': {
                'gh': gh,
                'isGlobalAdminUI': false
            }
        }, $('#gh-header'));
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

        // Bind the validator to the login form
        $('.gh-signin-form').validator({
            'disable': false
        }).on('submit', doLogin);
    };

    /**
     * Render the tripos structure indicating which groups the selected user is part of
     *
     * @param  {Object}    triposData    The app's tripos structure
     * @private
     */
    var renderTriposStructure = function(triposData, user) {
        gh.utils.renderTemplate($('#gh-user-management-tripos-structure-template'), {
            'gh': gh,
            'triposData': triposData,
            'user': user
        }, $('#gh-user-management-tripos-structure-container'));
    };


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Get the user object from the user AutoSuggest field
     *
     * @return {User[]}    User object chosen in the user AutoSuggest field
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


    //////////////////////
    //  INITIALISATION  //
    //////////////////////

    /**
     * Submit the form with parts the user has access to
     *
     * @private
     * @return {Boolean}    Return false to avoid the default form submit behaviour
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
                    callback();
                } else {
                    updateGroupMember(changeSet[done], callback);
                }
            });
        };

        // Only submit changes when there are any
        if (changeSet.length) {
            updateGroupMember(changeSet[0], function() {
                gh.utils.notification('User access updated', 'The user\'s access to parts has been updated successfully', 'success');
                getTriposStructure();
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

        gh.utils.getTriposStructure(appId, getUserSelection().id, function(err, triposData) {
            gh.api.userAPI.getUser(getUserSelection().id, function(err, user) {
                renderTriposStructure(triposData, user);
            });
        });
    };

    /**
     * Set up the user search AutoSuggest
     *
     * @private
     */
    var setUpAutoSuggest = function() {
        $('#gh-user-management-search').autoSuggest('/api/users', {
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
                return data.results;
            },
            'selectionAdded': function(element, userId) {
                if (!_.isNumber(userId)) {
                    $(element).find('.as-close').click();
                } else {
                    getTriposStructure();
                }
            },
            'selectionRemoved': function(elem) {
                // Remove the previously selected user from the AutoSuggest
                elem.remove();
                // Empty the user management container
                $('#gh-user-management-tripos-structure-container').empty();
            }
        });
    };

    /**
     * Add bindings to various elements on the page
     *
     * @private
     */
    var addBinding = function() {
        // logout
        $('body').on('submit', '#gh-signout-form', doLogout);

        // Track an event when the user clicks the Cambridge logo
        $('body').on('click', '#gh-header-logo', function() {
            gh.utils.trackEvent(['Navigation', 'Cambridge Logo clicked'], null, null, function() {
                window.location = '/admin/';
            });
        });

        // Select/deselect all parts and subjects when a course is checked/unchecked
        $('body').on('change', '.gh-user-management-course-checkbox', function() {
            var checked = $(this).is(':checked');
            var $checkboxes = $(this).closest('li').find('.gh-user-management-subject-checkbox, .gh-user-management-part-checkbox');
            $checkboxes.prop('checked', checked);
        });

        // Select/deselect all parts when a subject is checked/unchecked
        $('body').on('change', '.gh-user-management-subject-checkbox', function() {
            var checked = $(this).is(':checked');
            var $checkboxes = $(this).closest('li').find('.gh-user-management-part-checkbox');
            $checkboxes.prop('checked', checked);
        });

        // Submit the group permissions form
        $('body').on('submit', '#gh-user-management-part-access-form', submitPartForm);
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

            // Render the header
            renderHeader();

            // Only show the login form is local authentication is enabled and shibboleth is disabled
            if (gh.config.enableLocalAuth && !gh.config.enableShibbolethAuth) {

                // Render the login form
                renderLoginForm();
            }
        } else {
            // Show the body as we're allowed access
            $('body').show();

            // Add event handlers
            addBinding();

            // Render the header
            renderHeader();

            // Show the page content
            $('#gh-main').show();

            // Set up user management
            setUpAutoSuggest();
        }
    };

    initIndex();
});
