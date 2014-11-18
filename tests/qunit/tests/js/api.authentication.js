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
    module('Authentication API');

    /*!
     * Generates a random user
     *
     * @param  {Function}    callback         Standard callback function
     * @param  {Object}      callback.err     Error object containing error code and error message
     * @param  {Object}      callback.user    Response object containing the created user
     * @api private
     */
    var _generateRandomUser = function(callback) {

        // Login with the global administrator
        gh.api.authenticationAPI.login('administrator', 'administrator', function(err, data) {
            if (err) {
                return callback(err);
            }

            var appId = gh.api.testsAPI.getRandomApp().id;
            var displayName = gh.api.utilAPI.generateRandomString();
            var email = gh.api.utilAPI.generateRandomString();
            var password = gh.api.utilAPI.generateRandomString();

            // Create a new user
            gh.api.userAPI.createUser(appId, displayName, email, password, null, null, null, function(err, user) {
                if (err) {
                    return callback(err);
                }
                return callback(null, user, password);
            });
        });
    };

    // Test the login functionality
    QUnit.asyncTest('login', function(assert) {
        expect(3);

        // Create a new user
        _generateRandomUser(function(err, user, password) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid user id was provided
            gh.api.authenticationAPI.login(null, password, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                // Verify that an error is thrown when an invalid password was provided
                gh.api.authenticationAPI.login(user.id, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid password was provided');
                    QUnit.start();

                    /**
                     * TODO: wait for back-end implementation
                     *
                    // Verifty that a user can login without errors
                    gh.api.authenticationAPI.login(user.id, password, function(err, data) {
                        assert.ok(!err, 'Verifty that a user can login without errors');
                        assert.ok(data, 'Verify that the logged user is returned');
                        QUnit.start();
                    });
                    */
                });
            });
        });
    });

    QUnit.start();
});
