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
    module('User API');

    /*
    // Test the getMe functionality
    QUnit.asyncTest('getMe', function(assert) {
        expect(1);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that administrators can be created without retrieving an error');

            // TODO: write test for getMe
            QUnit.start();
        });
    });
    */

    // Test the getUser functionality
    QUnit.test('getUser', function(assert) {
        assert.ok(true);
    });

    // Test the getUsers functionality
    QUnit.test('getUsers', function(assert) {
        assert.ok(true);
    });

    // Test the getUserCalender functionality
    QUnit.test('getUserCalender', function(assert) {
        assert.ok(true);
    });

    // Test the getUserCalenderIcal functionality
    QUnit.test('getUserCalenderIcal', function(assert) {
        assert.ok(true);
    });

    // Test the getUserCalenderRSS functionality
    QUnit.test('getUserCalenderRSS', function(assert) {
        assert.ok(true);
    });

    // Test the getUserUpcoming functionality
    QUnit.test('getUserUpcoming', function(assert) {
        assert.ok(true);
    });

    // Test the getTermsAndConditions functionality
    QUnit.test('getTermsAndConditions', function(assert) {
        assert.ok(true);
    });

    // Test the acceptTermsAndConditions functionality
    QUnit.test('acceptTermsAndConditions', function(assert) {
        assert.ok(true);
    });

    // Test the createUser functionality
    QUnit.test('createUser', function(assert) {
        assert.ok(true);
    });

    // Test the importUsers functionality
    QUnit.test('importUsers', function(assert) {
        assert.ok(true);
    });

    // Test the updateUser functionality
    QUnit.test('updateUser', function(assert) {
        assert.ok(true);
    });

    // Test the updateAdminStatus functionality
    QUnit.test('updateAdminStatus', function(assert) {
        assert.ok(true);
    });

    // Test the setUserPicture functionality
    QUnit.test('setUserPicture', function(assert) {
        assert.ok(true);
    });

    // Test the cropPicture functionality
    QUnit.test('cropPicture', function(assert) {
        assert.ok(true);
    });

    QUnit.start();
});
