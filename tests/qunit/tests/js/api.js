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

require(['gh.core', 'jquery'], function(gh, $) {
    module('API');

    var user = {
        'username': 'John Doe',
        'displayName': 'JohnDoe',
        'password': 'password'
    };

    // Test the createAdmin functionality
    QUnit.asyncTest('Admin API: createAdmin', function(assert) {
        expect(4);

        // Verify that an error is thrown when an invalid value for 'username' was provided
        gh.api.adminAPI.createAdmin(null, user.displayName, user.password, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid value for \'username\' was provided');

            // Verify that an error is thrown when an invalid value for 'displayName' was provided
            gh.api.adminAPI.createAdmin(user.username, null, user.password, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for \'displayName\' was provided');

                // Verify that an error is thrown when an invalid value for 'password' was provided
                gh.api.adminAPI.createAdmin(user.username, user.displayName, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for \'password\' was provided');

                    // Verify that administrators can be created without retrieving an error
                    gh.api.adminAPI.createAdmin(user.username, user.displayName, user.password, function(err, data) {
                        assert.ok(!err, 'Verify that administrators can be created without retrieving an error');
                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the getAdmins functionality
    QUnit.asyncTest('Admin API: getAdmins', function(assert) {
        expect(3);

        // Verify that an error is thrown when an invalid value for 'limit' was provided
        gh.api.adminAPI.getAdmins('some_string', null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid value for \'limit\' was provided');

            // Verify that an error is thrown when an invalid value for 'limit' was provided
            gh.api.adminAPI.getAdmins(null, 'some_string', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for \'offset\' was provided');

                // Verify administrators can be retrieved without error
                gh.api.adminAPI.getAdmins(null, null, function(err, data) {
                    assert.ok(!err, 'Verify administrators can be retrieved without retrieving an error');
                    QUnit.start();
                });
            });
        });
    });

    /*
    // Test the getMe functionality
    QUnit.asyncTest('Admin API: getMe', function(assert) {
        expect(0);
        gh.api.adminAPI.createAdmin(null, null, null, function(err, data) {
            QUnit.start();
        });
    });
    */

    // Test the updateAdmin functionality
    QUnit.asyncTest('Admin API: updateAdmin', function(assert) {
        expect(3);

        // Verify that an error is thrown when an invalid value for 'userId' was provided
        gh.api.adminAPI.updateAdmin(null, user.displayName, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid value for \'userId\' was provided');

            // Verify that an error is thrown when an invalid value for \'displayName\' was provided
            gh.api.adminAPI.updateAdmin(2, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for \'displayName\' was provided');

                // Verify that an error is thrown when an invalid value for \'displayName\' was provided
                gh.api.adminAPI.updateAdmin(2, user.displayName, function(err, data) {
                    assert.ok(!err, 'Verify administrators can be updated without retrieving an error');
                    QUnit.start();
                });
            });
        });
    });

    QUnit.start(1);
});
