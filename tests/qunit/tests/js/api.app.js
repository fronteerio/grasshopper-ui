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
    module('App API');

    // Test the getApps functionality
    QUnit.asyncTest('getApps', function(assert) {
        expect(5);

        // Fetch a random test tenant
        var tenant = gh.api.testsAPI.getRandomTenant();

        // Verify that an error is thrown when an invalid tenantId was provided
        gh.api.appAPI.getApps(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid tenantId was provided');

            // Verify that an error is thrown when an invalid callback was provided
            try {
                gh.api.appAPI.getApps(tenant.id);
            } catch(err) {
                assert.ok(err, 'Verify that an error is thrown when an invalid callback was provided');
            } finally {

                // Verify that the apps can be retrieved without errors
                gh.api.appAPI.getApps(tenant.id, function(err, data) {
                    assert.ok(!err, 'Verify that the apps can be retrieved without errors');
                    assert.ok(data, 'Verify that the apps are returned');
                    assert.strictEqual(tenant.apps.length, data.length, 'Verify that the correct apps are returned');
                    QUnit.start();
                });
            }
        });
    });

    QUnit.start();
});
