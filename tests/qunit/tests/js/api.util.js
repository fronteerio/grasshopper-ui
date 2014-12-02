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
    module('Util API');

    // Add a template to the page
    $('body').append('<script id="qunit-template" type="text/template">Hi, <%= name %></script>');
    // Create the data to use in the template
    var templateData = {
        'name': 'Mathieu'
    };
    // Add a target container to the page
    $('body').append('<div id="qunit-template-target" style="display: none;"></div>');

    // Test the 'generateRandomString' functionality
    QUnit.test('generateRandomString', function(assert) {

        // Verify that only boolean values are allowed as a parameter
        assert.throws(function() {
            gh.api.utilAPI.generateRandomString('invalid_value');
        }, 'Verify that only boolean values are allowed as a parameter');

        // Verify that the returned string has exactly 10 characters
        assert.strictEqual(gh.api.utilAPI.generateRandomString().length, 10, 'Verify that the returned string has exactly 10 characters');

        // Verify that the returned string does not contain any uppercase characters when lowercase is specified
        assert.ok((/^[a-z]*$/).test(gh.api.utilAPI.generateRandomString(true)));

        // Verify that the returned string contains uppercase and/or lowercase characters when lowercase is not specified
        assert.ok((/[A-Z]/g).test(gh.api.utilAPI.generateRandomString()));
    });

    // Test the 'renderTemplate' functionality
    QUnit.test('renderTemplate', function(assert) {
        // Verify that a template needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.renderTemplate(null, templateData, $('#qunit-template-target'));
        }, 'Verify that a template needs to be provided');

        // Verify that the template renders in the target container
        gh.api.utilAPI.renderTemplate($('#qunit-template'), templateData, $('#qunit-template-target'));
        assert.equal($('#qunit-template-target').text(), 'Hi, Mathieu', 'Verify the template HTML is rendered in the target container when specified');

        // Verify that the rendered HTML is returned when no target is specified
        var returnedHTML = gh.api.utilAPI.renderTemplate($('#qunit-template'), templateData);
        assert.equal(returnedHTML, 'Hi, Mathieu', 'Verify the rendered HTML returns when no target container is specified');
    });


    ////////////////
    //  CALENDAR  //
    ////////////////

    // Test the 'convertISODatetoUnixDate' functionality
    QUnit.test('convertISODatetoUnixDate', function(assert) {
        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.convertISODatetoUnixDate(null);
        }, 'Verify that a valid date needs to be provided');

        // Verify that a valid string should be provided
        assert.throws(function() {
            gh.api.utilAPI.convertISODatetoUnixDate(9999);
        }, 'Verify that a valid string should be provided');

        // Verify that a valid date format should be provided
        assert.throws(function() {
            gh.api.utilAPI.convertISODatetoUnixDate('12-3456-78');
        }, 'Verify that a valid date format should be provided');

        var date = '2014-11-28T10:50:49.000Z';
        var convertedDate = gh.api.utilAPI.convertISODatetoUnixDate(date);

        // Verify that the date is converted correctly
        assert.strictEqual(convertedDate, 1417171849000, 'Verify that the date is converted correctly');
    });

    // Test the 'convertUnixDatetoISODate' functionality
    QUnit.test('convertUnixDatetoISODate', function(assert) {
        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.convertUnixDatetoISODate(null);
        }, 'Verify that a valid date needs to be provided');

        // Verify that a valid numeric date should be provided
        assert.throws(function() {
            gh.api.utilAPI.convertUnixDatetoISODate('invalid_date');
        }, 'Verify that a valid numeric date should be provided');

        var date = 1417171849000;
        var convertedDate = gh.api.utilAPI.convertUnixDatetoISODate(date);

        // Verify that the date is converted correctly
        assert.strictEqual(convertedDate, '2014-11-28T10:50:49.000Z', 'Verify that the date is converted correctly');
    });

    // Test the 'isDateInRange' functionality
    QUnit.test('isDateInRange', function(assert) {

        var date = Date.now();
        var startDate = Date.now() - (60 * 60 * 24 * 7);
        var endDate = Date.now() + (60 * 60 * 24 * 7);

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.isDateInRange(null, startDate, endDate);
        }, 'Verify that a date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.isDateInRange('invalid_date', startDate, endDate);
        }, 'Verify that a valid date needs to be provided');

        // Verify that a startDate needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.isDateInRange(date, null, endDate);
        }, 'Verify that a startDate needs to be provided');

        // Verify that a valid startDate needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.isDateInRange(date, 'invalid_date', endDate);
        }, 'Verify that a valid startDate needs to be provided');

        // Verify that a endDate needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.isDateInRange(date, startDate, null);
        }, 'Verify that an endDate needs to be provided');

        // Verify that a valid endDate needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.isDateInRange(date, startDate, 'invalid_date');
        }, 'Verify that a valid endDate needs to be provided');

        // Verify that en error is thrown when the startDate is after the endDate
        assert.throws(function() {
            gh.api.utilAPI.isDateInRange(date, endDate, startDate);
        }, 'Verify that en error is thrown when the startDate is after the endDate');

        // Verify that true is returned when a date is within a range of dates
        assert.ok(gh.api.utilAPI.isDateInRange(date, startDate, endDate));

        // Verify that false is returned when a date is outside a range of dates
        assert.ok(!gh.api.utilAPI.isDateInRange(startDate, date, endDate));
    });

    // Test the 'weeksInDateRange' functionality
    QUnit.test('weeksInDateRange', function(assert) {

        var startDate = Date.now() - (60 * 60 * 24 * 7);
        var endDate = Date.now() + (60 * 60 * 24 * 7);

        // Verify that a startDate needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.weeksInDateRange(null, endDate);
        }, 'Verify that a startDate needs to be provided');

        // Verify that a valid startDate needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.weeksInDateRange('invalid_date', endDate);
        }, 'Verify that a valid startDate needs to be provided');

        // Verify that an endDate needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.weeksInDateRange(startDate, null);
        }, 'Verify that an endDate needs to be provided');

        // Verify that a valid endDate needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.weeksInDateRange(startDate, 'invalid_date');
        }, 'Verify that a valid endDate needs to be provided');

        // Verify that en error is thrown when the startDate is after the endDate
        assert.throws(function() {
            gh.api.utilAPI.weeksInDateRange(endDate, startDate);
        }, 'Verify that en error is thrown when the startDate is after the endDate');

        // Verify that the correct number of weeks are returned
        var numWeeks = gh.api.utilAPI.weeksInDateRange(startDate, endDate);
        assert.equal(2, numWeeks);
    });


    ///////////////////
    // NOTIFICATIONS //
    ///////////////////

    // Test the 'notification' functionality
    QUnit.test('notification', function(assert) {
        // Verify that a message for the notification needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.notification();
        }, 'Verify that a message for the notification needs to be provided');

        // Verify that a notification can be triggered with only a message
        assert.ok(gh.api.utilAPI.notification(null, 'Notification message'), 'Verify that a notification can be triggered with only a message');

        // Verify that a notification can be triggered with a title and a message
        assert.ok(gh.api.utilAPI.notification('Notification title', 'Notification message'), 'Verify that a notification can be triggered with a title and a message');
    });

    testAPI.init();
});
