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

require(['gh.core', 'gh.api.tests'], function(gh, testAPI) {
    module('Groups API');

    // Test the getGroupMembers functionality
    QUnit.asyncTest('getGroupMembers', function(assert) {
        expect(9);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.groupsAPI.getGroupMembers(1, 0, 0);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when no group ID was provided
        gh.api.groupsAPI.getGroupMembers(null, 0, 0, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no group ID was provided');

            // Verify that an error is thrown when an invalid group ID was provided
            gh.api.groupsAPI.getGroupMembers('invalid_group_id', 0, 0, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid group ID was provided');

                // Verify that an error is thrown when an invalid value for limit was provided
                gh.api.groupsAPI.getGroupMembers(1, 'invalid_limit', 0, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for limit was provided');

                    // Verify that an error is thrown when an invalid value for offset was provided
                    gh.api.groupsAPI.getGroupMembers(1, 0, 'invalid_offset', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for offset was provided');

                        // Verify that group members can be retrieved without errors
                        gh.api.groupsAPI.getGroupMembers(1, 0, 0, function(err, data) {
                            assert.ok(!err, 'Verify that group members can be retrieved without errors');
                            assert.ok(data, 'Verify that the group members are returned');

                            // Verify that the error is handled
                            body = {'code': 400, 'msg': 'Bad Request'};
                            gh.utils.mockRequest('GET', '/api/groups/' + 1 + '/members', 400, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.groupsAPI.getGroupMembers(1, null, null, function(err, data) {
                                    assert.ok(err, 'Verify that the error is handled when the group members can\'t be successfully retrieved');
                                    assert.ok(!data, 'Verify that no data returns when the group members can\'t be successfully retrieved');
                                    QUnit.start();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the updateGroupMembers functionality
    QUnit.asyncTest('updateGroupMembers', function(assert) {
        expect(8);

        // Group member updates object
        var updates = {
            '1': false
        };

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.groupsAPI.updateGroupMembers(1, updates);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when no group ID was provided
        gh.api.groupsAPI.updateGroupMembers(null, updates, function(err) {
            assert.ok(err, 'Verify that an error is thrown when no group ID was provided');

            // Verify that an error is thrown when an invalid group ID was provided
            gh.api.groupsAPI.updateGroupMembers('invalid_group_id', updates, function(err) {
                assert.ok(err, 'Verify that an error is thrown when an invalid group ID was provided');

                // Verify that an error is thrown when no updates object was provided
                gh.api.groupsAPI.updateGroupMembers(1, null, function(err) {
                    assert.ok(err, 'Verify that an error is thrown when no updates object was provided');

                    // Verify that an error is thrown when an invalid updates object was provided
                    gh.api.groupsAPI.updateGroupMembers(1, 'invalid_updates', function(err) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid updates object was provided');

                        // Verify that an error is thrown when an empty updates object was provided
                        gh.api.groupsAPI.updateGroupMembers(1, {}, function(err) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid updates object was provided');

                            // Mock a successful response from the server
                            body = {'msg': 'OK'};
                            gh.utils.mockRequest('POST', '/api/groups/' + 1 + '/members', 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.groupsAPI.updateGroupMembers(1, updates, function(err) {
                                    assert.ok(!err, 'Verify that group members can be successfully updated');

                                    // Mock a failed response from the server
                                    body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.utils.mockRequest('POST', '/api/groups/' + 1 + '/members', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.groupsAPI.updateGroupMembers(1, updates, function(err) {
                                            assert.ok(err, 'Verify that an error is thrown when group members can\'t be updated successfully');
                                            QUnit.start();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the lock functionality
    QUnit.asyncTest('lock', function(assert) {
        expect(2);

        // Verify that an error is thrown when no group ID was provided
        assert.throws(function() {
            gh.api.groupsAPI.lock(null);
        }, 'Verify that an error is thrown when no group ID was provided');

        // Verify that an error is thrown when an invalid group ID was provided
        assert.throws(function() {
            gh.api.groupsAPI.lock('invalid_group_id');
        }, 'Verify that an error is thrown when an invalid group ID was provided');

        QUnit.start();
    });

    // Test the unlock functionality
    QUnit.asyncTest('unlock', function(assert) {
        expect(2);

        // Verify that an error is thrown when no group ID was provided
        assert.throws(function() {
            gh.api.groupsAPI.unlock(null);
        }, 'Verify that an error is thrown when no group ID was provided');

        // Verify that an error is thrown when an invalid group ID was provided
        assert.throws(function() {
            gh.api.groupsAPI.unlock('invalid_group_id');
        }, 'Verify that an error is thrown when an invalid group ID was provided');

        QUnit.start();
    });

    testAPI.init();
});
