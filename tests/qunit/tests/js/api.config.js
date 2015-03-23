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
    module('Config API');


    // Test the `getConfig` functionality
    QUnit.asyncTest('getConfig', function(assert) {
        expect(7);

        var testApp = testAPI.getTestApp();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.configAPI.getConfig(testApp.id);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.configAPI.getConfig(testApp.id, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when an invalid appId was provided
        gh.api.configAPI.getConfig('invalid_appid', function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid appId was provided');

            // Verify that the configuration can be retrieved without errors
            gh.api.configAPI.getConfig(testApp.id, function(err, data) {
                assert.ok(!err, 'Verify that the configuration can be retrieved without errors');
                assert.ok(data, 'Verify that the configuration are returned');

                // Verify that the getting configuration for a non-existing app fails
                gh.api.configAPI.getConfig(999999999, function(err, data) {
                    assert.ok(err, 'Verify that the getting configuration for a non-existing app fails');
                    assert.ok(!data, 'Verify that the getting configuration for a non-existing app returns no data');

                    QUnit.start();
                });
            });
        });
    });

    // Test the `getStaticConfig` functionality. some of this is covered in the `getConfig` test as it calls `getStaticConfig`
    QUnit.asyncTest('getStaticConfig', function(assert) {
        expect(4);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.configAPI.getStaticConfig();
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.configAPI.getStaticConfig('invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that the error is handled when the static config file can't be loaded successfully
        body = {'code': 400, 'msg': 'Bad Request'};
        gh.utils.mockRequest('GET', '/shared/gh/files/config.json', 400, {'Content-Type': 'application/json'}, body, function() {
            gh.api.configAPI.getStaticConfig(function(err, data) {
                assert.ok(err, 'Verify that the error is handled when the static config can\'t be successfully loaded');
                assert.ok(!data, 'Verify that no data returns when the static config can\'t be successfully loaded');
                QUnit.start();
            });
        });
    });

    // Test the `updateConfig` functionality
    QUnit.asyncTest('updateConfig', function(assert) {
        expect(8);

        var testApp = testAPI.getTestApp();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.configAPI.updateConfig(testApp.id, {'enableAnalytics': true}, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Invoke the funtionality without callback
        assert.equal(null, gh.api.configAPI.updateConfig(testApp.id, {'enableAnalytics': true}), 'Verify that a default callback is set when none is provided and no error is thrown');

        // Verify that an error is thrown when an invalid appId was provided
        gh.api.configAPI.updateConfig('invalid_appid', {'enableAnalytics': true}, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid appId was provided');

            // Verify that an error is thrown when no configValues were provided
            gh.api.configAPI.updateConfig(testApp.id, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no configValues are provided');

                // Verify that an error is thrown when invalid configValues were provided
                gh.api.configAPI.updateConfig(testApp.id, 'invalid_configuration_values', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when invalid configValues are provided');

                    // Verify that a config value can be updated without errors
                    gh.api.configAPI.updateConfig(testApp.id, {'enableAnalytics': false}, function(err, data) {
                        assert.ok(!err, 'Verify that the config can be successfully updated');

                        // Verify that the error is handled when a config value can't be updated successfully
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('POST', '/api/config', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.configAPI.updateConfig(testApp.id, {'enableAnalytics': false}, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the config can\'t be successfully updated');
                                assert.ok(!data, 'Verify that no data returns when the config can\'t be successfully updated');
                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    testAPI.init();
});
