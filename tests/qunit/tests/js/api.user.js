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

require(['gh.core'], function(gh) {
    QUnit.module('User API');

    /*!
     * Generates a random user
     *
     * @param  {Object}      [user]             Object containing user data
     * @param  {Function}    callback           Standard callback function
     * @param  {Object}      callback.err       Error object containing error code and error message
     * @param  {Object}      callback.user      Response object containing the created user
     * @api private
     */
    var _generateRandomUser = function(user, callback) {

        // Create a new user
        user =_.extend({
            'displayName': gh.api.utilAPI.generateRandomString(),
            'email': gh.api.utilAPI.generateRandomString(),
            'password': gh.api.utilAPI.generateRandomString()
        }, user);

        gh.api.userAPI.createUser(null, user.displayName, user.email, user.password, null, null, null, function(err, user) {
            if (err) {
                return callback(err);
            }

            return callback(null, user);
        });
    };

    /*
     * TODO: wait for back-end implementation
     *
    // Test the getMe functionality
    QUnit.asyncTest('getMe', function(assert) {
        expect(3);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that users can be retrieved without errors
            gh.api.userAPI.getMe(function(err, data) {
                assert.ok(!err, 'Verify that the current can be retrieved without errors');
                assert.ok(data, 'Verify that the current user is returned');
                QUnit.start();
            });
        });
    });*/

    // Test the getUser functionality
    QUnit.asyncTest('getUser', function(assert) {
        expect(2);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid user id was provided
            gh.api.userAPI.getUser(null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');
                QUnit.start();

                /*
                 * TODO: wait for back-end implementation
                 *
                // Verifty that a user can be retrieved without errors
                gh.api.userAPI.getUser(user.id, function(err, data) {
                    assert.ok(!err, 'Verify that a user can be retrieved without errors');
                    assert.ok(data, 'Verify that the requested user is returned');
                    QUnit.start();
                });
                */
            });
        });
    });

    // Test the getUsers functionality
    QUnit.asyncTest('getUsers', function(assert) {
        expect(3);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid value for limit was provided
            gh.api.userAPI.getUsers(null, 'invalid_limit', null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for limit was provided');

                // Verify that an error is thrown when an invalid value for offset was provided
                gh.api.userAPI.getUsers(null, 'invalid_limit', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for offset was provided');
                    QUnit.start();

                    /*
                     * TODO: wait for back-end implementation
                     *
                    // Verify that an error is thrown when an invalid value for offset was provided
                    gh.api.userAPI.getUsers(null, null, null, function(err, data) {
                        assert.ok(err, 'Verify that users can be retrieved without an error');
                        QUnit.start();
                    });
                    */
                });
            });
        });
    });

    // Test the getUserCalender functionality
    QUnit.asyncTest('getUserCalender', function(assert) {
        expect(4);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');
            console.log('1');

            // Verify that an error is thrown when an invalid user id was provided
            gh.api.userAPI.getUserCalendar(null, '2013-10-01', '2014-07-31', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');
                console.log('2');

                // Verify that an error is thrown when an invalid value for 'from' was provided
                gh.api.userAPI.getUserCalender(user.id, null, '2014-07-31', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for \'from\' was provided');
                    console.log('3');

                    // Verify that an error is thrown when an invalid value for 'to' was provided
                    gh.api.userAPI.getUserCalender(user.id, '2013-10-01', null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for \'to\' was provided');
                        console.log('4');
                        QUnit.start();

                        /**
                         * Wait for back-end implementation
                         *
                        // Verify that users can be retrieved without errors
                        gh.api.userAPI.getUsers(null, null, null, function(err, data) {
                            assert.ok(!err, 'Verify that users can be retrieved without errors');
                            assert.ok(data, 'Verify that the users are returned');
                            QUnit.start();
                        });
                        */
                    });
                });
            });
        });
    });

    /*
    // Test the getUserCalenderIcal functionality
    QUnit.asyncTest('getUserCalenderIcal', function(assert) {
        expect(2);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid user id was provided
            gh.api.userAPI.getUserCalendarIcal(null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');
                QUnit.start();
            });
        });
    });

    /*
    // Test the getUserCalenderRSS functionality
    QUnit.asyncTest('getUserCalenderRSS', function(assert) {
        expect(1);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            QUnit.start();
        });
    });

    // Test the getUserUpcoming functionality
    QUnit.asyncTest('getUserUpcoming', function(assert) {
        expect(1);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            QUnit.start();
        });
    });

    // Test the getTermsAndConditions functionality
    QUnit.asyncTest('getTermsAndConditions', function(assert) {
        expect(1);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            QUnit.start();
        });
    });

    // Test the acceptTermsAndConditions functionality
    QUnit.asyncTest('acceptTermsAndConditions', function(assert) {
        expect(1);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            QUnit.start();
        });
    });

    // Test the createUser functionality
    QUnit.asyncTest('createUser', function(assert) {
        expect(1);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            QUnit.start();
        });
    });

    // Test the importUsers functionality
    QUnit.asyncTest('importUsers', function(assert) {
        expect(1);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            QUnit.start();
        });
    });

    // Test the updateUser functionality
    QUnit.asyncTest('updateUser', function(assert) {
        expect(1);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            QUnit.start();
        });
    });

    // Test the updateAdminStatus functionality
    QUnit.asyncTest('updateAdminStatus', function(assert) {
        expect(1);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            QUnit.start();
        });
    });

    // Test the setUserPicture functionality
    QUnit.asyncTest('setUserPicture', function(assert) {
        expect(1);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            QUnit.start();
        });
    });

    // Test the cropPicture functionality
    QUnit.asyncTest('cropPicture', function(assert) {
        expect(1);

        // Create a new user
        _generateRandomUser(null, function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            QUnit.start();
        });
    });
    */

    QUnit.start();
});
