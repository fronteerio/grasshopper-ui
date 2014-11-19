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

require(['gh.core', 'gh.api.tests'], function(gh, testAPI) {
    module('Tenant API');

    // Test the getTenants functionality
    QUnit.asyncTest('getTenants', function(assert) {
        expect(3);

        // Verify that an error is thrown when an invalid callback was provided
        try {
            gh.api.tenantAPI.getTenants();
        } catch(err) {
            assert.ok(err, 'Verify that an error is thrown when an invalid callback was provided');
        } finally {

            // Verify that the tenants can be retrieved without errors
            gh.api.tenantAPI.getTenants(function(err, data) {
                assert.ok(!err, 'Verify that the tenants can be retrieved without errors');
                assert.ok(data, 'Verify that the tenants are returned');
                QUnit.start();
            });
        }
    });

    testAPI.init();
});
