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

/**
 * User API functions
 */
var userAPI = (function() {

    /**
     * Creates a given number of users
     *
     * @param  {Number}      [numToCreate]             The number of users to create. Defaults to creating 1 user
     * @param  {Boolean}     isAdmin                   Whether or not the created users should be tenant admins. Defaults to `false`
     * @param  {Function}    callback                  Standard callback function
     * @param  {User[]}      callback.userProfiles     Array of user objects representing the created users
     */
    var createUsers = function(numToCreate, isAdmin, callback) {

        // Point casper to the admin UI
        casper.start(configAPI.adminUI, function() {

            // Log in as the global administrator
            doLogin({'email': 'administrator', 'password': 'administrator'}, function(err) {
                if (err) {
                    return casper.echo('X Failed to login with the global administrator', 'ERROR');
                }

                // Start creating test users
                casper.then(function() {
                    var toCreate = numToCreate || 1;
                    var created = 0;
                    var userProfiles = [];
                    // Default isAdmin to false when it's not provided
                    isAdmin = isAdmin || false;

                    /**
                     * Create a user
                     */
                    var createUser = function() {
                        var rndString = mainUtil.generateRandomString();
                        var rndPassword = mainUtil.generateRandomString();
                        var params = [1, 'user-' + rndString, 'user-' + rndString + '@example.com', rndPassword, 'no', isAdmin, null, null];

                        mainUtil.callInternalAPI('user', 'createUser', params, function(err, userProfile) {
                            if (err) {
                                return casper.echo('Could not create user-' + rndString + '. Error ' + err.code + ': ' + err.msg, 'ERROR');
                            } else {
                                userProfile.password = rndPassword;
                                userProfiles.push(userProfile);

                                created++;
                            }
                        });
                    };

                    // Get the me object
                    var me = null;
                    mainUtil.callInternalAPI('user', 'getMe', null, function(err, _me) {
                        if (err) {
                            return casper.echo(JSON.stringify(err, null, 4), 'ERROR');
                        }
                        me = _me;

                        // Only start creating users the global administrator is logged in
                        if (!me.anon) {
                            casper.then(function() {
                                casper.repeat(toCreate, createUser);
                            });
                        } else {
                            casper.then(function() {
                                doLogOut();
                            });
                        }
                    });

                    // Wait until all user profiles have been created and execute the callback
                    // passing in the created user profiles
                    casper.waitFor(function() {
                        return userProfiles.length === toCreate;
                    }, function() {
                        doLogOut();
                        return callback.apply(this, userProfiles);
                    });
                });
            });
        });
    };

    /**
     * Log out of the tenant
     */
    var doLogOut = function() {
        casper.thenEvaluate(function() {
            $('form[action="/api/auth/logout"]').submit();
        });
    };

    /**
     * Log in with the specified user
     *
     * @param  {User}        user        The user object to log in with
     * @param  {Function}    callback    Standard callback function
     */
    var doLogin = function(user, callback) {
        casper.waitForSelector('#gh-right-container #gh-header #gh-signin-form', function() {
            casper.fill('#gh-signin-form', {
                'username': user.email,
                'password': user.password
            }, true);
            casper.waitForSelector('#gh-right-container #gh-header #gh-signout-form', function() {
                callback();
            });
        });
    };

    return {
        'createUsers': createUsers,
        'doLogin': doLogin,
        'doLogOut': doLogOut
    };
})();
