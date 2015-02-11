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

    // Mock a configuration object to test with
    require('gh.core').config = {
        "terms": {
            "2014": [
                {
                    "name": "michaelmas",
                    "label": "Michaelmas",
                    "start": "2014-10-07T00:00:00.000Z",
                    "end": "2014-12-04T00:00:00.000Z"
                },
                {
                    "name": "lent",
                    "label": "Lent",
                    "start": "2015-01-13T00:00:00.000Z",
                    "end": "2015-03-13T00:00:00.000Z"
                },
                {
                    "name": "easter",
                    "label": "Easter",
                    "start": "2015-04-21T00:00:00.000Z",
                    "end": "2015-06-12T00:00:00.000Z"
                }
            ]
        },
        'academicYear': 2014
    };


    ////////////////
    //  CALENDAR  //
    ////////////////

    // Test the 'addLeadingZero' functionality
    QUnit.test('addLeadingZero', function(assert) {
        // Verify that a digit needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.addLeadingZero();
        }, 'Verify that a date needs to be provided');

        // Verify that a digit needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.addLeadingZero('invalid_digit');
        }, 'Verify that a date needs to be provided');

        // Verify that no leading zero is added when unnecessary
        assert.strictEqual(gh.api.utilAPI.addLeadingZero(10), '10', 'Verify that no leading zero is added when unnecessary');

        // Verify that a leading zero is added when necessary
        assert.strictEqual(gh.api.utilAPI.addLeadingZero(1), '01', 'Verify that a leading zero is added when necessary');
    });

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

    // Test the 'generateDisplayDate' functionality
    QUnit.test('generateDisplayDate', function(assert) {
        var startDate = '2015-02-18T10:00:00.000Z';
        var endDate = '2015-02-18T17:30:00.000Z';

        // Verify that a start date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.generateDisplayDate(null, endDate);
        }, 'Verify that a start date needs to be provided');

        // Verify that a valid start date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.generateDisplayDate(99999, endDate);
        }, 'Verify that a valid start date needs to be provided');

        // Verify that a valid start date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.generateDisplayDate('invalid_start_date', endDate);
        }, 'Verify that a valid start date needs to be provided');

        // Verify that an and date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.generateDisplayDate(startDate, null);
        }, 'Verify that an end date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.generateDisplayDate(startDate, 99999);
        }, 'Verify that a valid end date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.generateDisplayDate(startDate, 'invalid_end_date');
        }, 'Verify that a valid end date needs to be provided');

        // Verify that all the cases are covered
        assert.strictEqual(gh.api.utilAPI.generateDisplayDate('2015-02-18T10:00:00.000Z', '2015-02-18T17:30:00.000Z'), 'W6 · Wed 10am-5:30pm');
        assert.strictEqual(gh.api.utilAPI.generateDisplayDate('2015-02-18T16:00:00.000Z', '2015-02-18T17:30:00.000Z'), 'W6 · Wed 4-5:30pm');
        assert.strictEqual(gh.api.utilAPI.generateDisplayDate('2015-02-18T10:00:00.000Z', '2015-02-18T11:30:00.000Z'), 'W6 · Wed 10-11:30am');
        assert.strictEqual(gh.api.utilAPI.generateDisplayDate('2015-02-18T10:30:00.000Z', '2015-02-18T11:00:00.000Z'), 'W6 · Wed 10:30-11am');
        assert.strictEqual(gh.api.utilAPI.generateDisplayDate('2015-02-18T10:30:00.000Z', '2015-02-18T13:30:00.000Z'), 'W6 · Wed 10:30am-1:30pm');
        assert.strictEqual(gh.api.utilAPI.generateDisplayDate('2015-01-01T10:30:00.000Z', '2015-01-01T13:30:00.000Z'), 'OT · Thu 10:30am-1:30pm');
    });

    // Test the 'getWeeksInTerm' functionality
    QUnit.test('getWeeksInTerm', function(assert) {
        // Get the first term of 2014 which has 9 weeks in it
        // Verify that a valid term needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.getWeeksInTerm();
        }, 'Verify that a valid term needs to be provided');

        // Verify that the correct number of weeks is returned
        assert.strictEqual(gh.api.utilAPI.getWeeksInTerm(require('gh.core').config.terms['2014'][0]), 9, 'Verify that the correct number of weeks is returned');
    });

    // Test the 'getFirstDayOfTerm' functionality
    QUnit.test('getFirstDayOfTerm', function(assert) {
        // Verify that a valid term name needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.getFirstDayOfTerm(null);
        }, 'Verify that a valid term name needs to be provided');

        // Use the first day of Michaelmas to test with
        var testDate = new Date('2014-10-07T00:00:00.000Z');
        assert.strictEqual(gh.api.utilAPI.getFirstDayOfTerm('michaelmas').getDay(), testDate.getDay(), 'Verify that the correct day is returned');
        assert.strictEqual(gh.api.utilAPI.getFirstDayOfTerm('michaelmas').getMonth(), testDate.getMonth(), 'Verify that the correct month is returned');
        assert.strictEqual(gh.api.utilAPI.getFirstDayOfTerm('michaelmas').getFullYear(), testDate.getFullYear(), 'Verify that the correct year is returned');
    });

    // Test the 'getDateByWeekAndDay' functionality
    QUnit.test('getDateByWeekAndDay', function(assert) {
        // Verify that a valid term name needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.getDateByWeekAndDay(null, 1, 1);
        }, 'Verify that a valid term name needs to be provided');

        // Verify that a valid week number needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.getDateByWeekAndDay('michaelmas', null, 1);
        }, 'Verify that a valid term name needs to be provided');

        // Verify that a valid day number needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.getDateByWeekAndDay('michaelmas', 1, null);
        }, 'Verify that a valid term name needs to be provided');

        // Verify that the correct date is returned
        var testDate = new Date('Wed Oct 22 2014 01:00:00 GMT+0100 (BST)');
        var testDate2 = new Date('Mon Oct 20 2014 01:00:00 GMT+0100 (BST)');
        assert.strictEqual(gh.api.utilAPI.getDateByWeekAndDay('michaelmas', 2, 3).getDay(), testDate.getDay(), 'Verify that the correct day is returned');
        assert.strictEqual(gh.api.utilAPI.getDateByWeekAndDay('michaelmas', 2, 3).getMonth(), testDate.getMonth(), 'Verify that the correct month is returned');
        assert.strictEqual(gh.api.utilAPI.getDateByWeekAndDay('michaelmas', 2, 1).getFullYear(), testDate2.getFullYear(), 'Verify that the correct year is returned');
    });

    // Test the 'dateDisplay' functionality
    QUnit.test('dateDisplay', function(assert) {
        var date = '2015-02-18T16:00:00.000Z';

        /* DAY */

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.dateDisplay(null).dayNumber();
        }, 'Verify that a date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.dateDisplay(9999).dayNumber();
        }, 'Verify that a valid date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.dateDisplay('invalid_date').dayNumber();
        }, 'Verify that a valid date needs to be provided');

        // Verify that the corret day is returned
        assert.strictEqual(gh.api.utilAPI.dateDisplay(date).dayNumber(), 18, 'Verify that the correct day is returned');

        /* MONTH */

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.dateDisplay(null).monthName();
        }, 'Verify that a date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.dateDisplay(9999).monthName();
        }, 'Verify that a valid date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.dateDisplay('invalid_date').monthName();
        }, 'Verify that a valid date needs to be provided');

        // Verify that the correct month is returned
        assert.strictEqual(gh.api.utilAPI.dateDisplay(date).monthName(), 'Feb', 'Verify that the correct month is returned');
    });

    // Test the 'fixDateToGMT' functionality
    QUnit.test('fixDateToGMT', function(assert) {

        // Verify that a date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.fixDateToGMT();
        }, 'Verify that a date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.fixDateToGMT(9999);
        }, 'Verify that a valid date needs to be provided');

        // Verify that a valid date needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.fixDateToGMT('invalid_date');
        }, 'Verify that a valid date needs to be provided');

        // Verify that a correct date is returned when a GMT+0 is specified
        assert.strictEqual(gh.api.utilAPI.fixDateToGMT('2015-02-11T16:00:00.000Z'), 1423670400000, 'Verify that a correct date is returned when a GMT+0 is specified');

        // Verify that a correct date is returned when a BST+1 is specified
        assert.strictEqual(gh.api.utilAPI.fixDateToGMT('2014-11-11T10:00:00.000Z'), 1415700000000, 'Verify that a correct date is returned when a BST+1 is specified');
    });

    // Test the 'fixDatesToGMT' functionality
    QUnit.test('fixDatesToGMT', function(assert) {

        // Verify that an array needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.fixDatesToGMT();
        }, 'Verify that an array needs to be provided');

        // Verify that a valid parameter needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.fixDatesToGMT('invalid_parameter');
        }, 'Verify that a valid parameter needs to be provided');

        // Convert some test event dates
        var events = [{
            'start': '2015-02-11T16:00:00.000Z',
            'end': '2014-11-11T10:00:00.000Z'
        }];
        gh.api.utilAPI.fixDatesToGMT(events);

        // Verify that the dates have been successfully converted
        assert.strictEqual(events[0].start, 1423670400000, 'Verify that the start date has been converted successfully');
        assert.strictEqual(events[0].end, 1415700000000, 'Verify that the end date has been converted successfully');
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

    // Test the 'splitEventsByTerm' functionality
    QUnit.test('splitEventsByTerm', function(assert) {
        expect(4);

        // Mock an Array of events to test with
        var events = {
            "results": [
                { // Michaelmas
                    "end": "2014-10-20T14:00:00.000Z",
                    "start": "2014-10-20T13:00:00.000Z"
                },
                { // Lent
                    "end": "2015-01-30T11:00:00.000Z",
                    "start": "2015-01-30T10:00:00.000Z"
                },
                { // Easter
                    "end": "2015-04-30T14:00:00.000Z",
                    "start": "2015-04-30T13:00:00.000Z"
                }
            ]
        };

        // Split the events by term
        var eventsByTerm = gh.api.utilAPI.splitEventsByTerm(events);

        // Verify that the returning events were correctly split by term
        assert.ok(eventsByTerm, 'Verify that events can be successfully split by term');
        assert.equal(eventsByTerm['Michaelmas'].length, 1, 'Verify that 1 event was triaged into Michaelmas');
        assert.equal(eventsByTerm['Lent'].length, 1, 'Verify that 1 event was triaged into Lent');
        assert.equal(eventsByTerm['Easter'].length, 1, 'Verify that 1 event was triaged into Easter');
    });


    ///////////////
    //  GENERAL  //
    ///////////////

    // Test the 'generateRandomString' functionality
    QUnit.test('generateRandomString', function(assert) {

        // Verify that only boolean values are allowed as a parameter
        assert.throws(function() {
            gh.api.utilAPI.generateRandomString('invalid_value');
        }, 'Verify that only boolean values are allowed as a parameter');

        // Verify that the returned string has exactly 10 characters
        assert.strictEqual(gh.api.utilAPI.generateRandomString().length, 10, 'Verify that the returned string has exactly 10 characters');

        // Verify that the returned string does not contain any uppercase characters when lowercase is specified
        assert.ok((/^[a-z0-9]*$/).test(gh.api.utilAPI.generateRandomString(true)));

        // Verify that the returned string contains uppercase and/or lowercase characters when lowercase is not specified
        assert.ok((/[A-Z0-9]/g).test(gh.api.utilAPI.generateRandomString()));
    });

    // Test the 'mockRequest' functionality
    QUnit.asyncTest('mockRequest', function(assert) {
        expect(9);

        // The mock request values
        var type = 'GET';
        var url = '/api/mockrequest';

        // The mock response values
        var body = {'code': 400, 'msg': 'Bad Request'};
        var headers = {'Content-Type': 'application/json'};
        var statusCode = 400;

        // Create a mock function
        var mockFunc = function() {};

        // Verify that an error is thrown when no type was provided
        assert.throws(function() {
            gh.api.utilAPI.mockRequest(null, url, statusCode, headers, body, mockFunc);
        }, 'Verify that an error is thrown when no type was provided');

        // Verify that an error is thrown when no url was provided
        assert.throws(function() {
            gh.api.utilAPI.mockRequest(type, null, statusCode, headers, body, mockFunc);
        }, 'Verify that an error is thrown when no url was provided');

        // Verify that an error is thrown when no statusCode was provided
        assert.throws(function() {
            gh.api.utilAPI.mockRequest(type, url, null, headers, body, mockFunc);
        }, 'Verify that an error is thrown when no statusCode was provided');

        // Verify that an error is thrown when no headers were provided
        assert.throws(function() {
            gh.api.utilAPI.mockRequest(type, url, statusCode, null, body, mockFunc);
        }, 'Verify that an error is thrown when no headers were provided');

        // Verify that an error is thrown when no body was provided
        assert.throws(function() {
            gh.api.utilAPI.mockRequest(type, url, statusCode, headers, null, mockFunc);
        }, 'Verify that an error is thrown when no body was provided');

        // Verify that an error is thrown when no function was provided
        assert.throws(function() {
            gh.api.utilAPI.mockRequest(type, url, statusCode, headers, body, null);
        }, 'Verify that an error is thrown when no function was provided');

        // Verify that a request can be successfully mocked
        gh.api.utilAPI.mockRequest(type, url, statusCode, headers, body, function() {
            $.ajax({
                'type': type,
                'url': url,
                'success': function(data) {
                    assert.fail('The success function should not be invoked');
                },
                'error': function(jqXHR, textStatus) {
                    assert.strictEqual(jqXHR.status, 400);
                    assert.strictEqual(jqXHR.responseJSON.code, 400);
                    assert.strictEqual(jqXHR.responseJSON.msg, 'Bad Request');
                }
            });

            QUnit.start();
        });
    });

    // Test the 'sortByDisplayName' functionality
    QUnit.test('sortByDisplayName', function(assert) {
        var testArr = [{
            'displayName': 'ZZZ'
        }, {
            'displayName': '1234'
        }, {
            'displayName': 'aaa'
        }, {
            'displayName': 'a1z2'
        }, {
            'displayName': 'aaa'
        }];

        testArr.sort(gh.api.utilAPI.sortByDisplayName);

        var sorted1 = testArr[0].displayName === '1234';
        var sorted2 = testArr[1].displayName === 'a1z2';
        var sorted3 = testArr[2].displayName === 'aaa';
        var sorted4 = testArr[3].displayName === 'aaa';
        var sorted5 = testArr[4].displayName === 'ZZZ';

        assert.ok(sorted1 && sorted2 && sorted3 && sorted4 && sorted5, 'Verify that the Array of objects is properly sorted on the displayName property');
    });

    // Test the 'sortByHost' functionality
    QUnit.test('sortByHost', function(assert) {
        var testArr = [{
            'host': 'ZZZ'
        }, {
            'host': '1234'
        }, {
            'host': 'aaa'
        }, {
            'host': 'a1z2'
        }, {
            'host': 'aaa'
        }];

        testArr.sort(gh.api.utilAPI.sortByHost);

        var sorted1 = testArr[0].host === '1234';
        var sorted2 = testArr[1].host === 'a1z2';
        var sorted3 = testArr[2].host === 'aaa';
        var sorted4 = testArr[3].host === 'aaa';
        var sorted5 = testArr[4].host === 'ZZZ';

        assert.ok(sorted1 && sorted2 && sorted3 && sorted4 && sorted5, 'Verify that the Array of objects is properly sorted on the host property');
    });


    //////////////////////
    // GOOGLE ANALYTICS //
    //////////////////////

    // Test the `sendTrackingEvent` functionality
    QUnit.test('sendTrackingEvent', function(assert) {
        // Verify that an error is thrown when no category was provided
        assert.throws(function() {
            gh.api.utilAPI.sendTrackingEvent(null, 'action', 'label', 1);
        }, 'Verify that an error is thrown when no category was provided');

        // Verify that an error is thrown when no action was provided
        assert.throws(function() {
            gh.api.utilAPI.sendTrackingEvent('category', null, 'label', 1);
        }, 'Verify that an error is thrown when no action was provided');

        // Verify that an error is thrown when no label was provided
        assert.throws(function() {
            gh.api.utilAPI.sendTrackingEvent('category', 'action', null, 1);
        }, 'Verify that an error is thrown when no label was provided');

        // Verify that an error is thrown when an invalid `value` was provided
        assert.throws(function() {
            gh.api.utilAPI.sendTrackingEvent('category', 'action', 'label', 'invalid_value');
        }, 'Verify that an error is thrown when an invalid `value` was provided');

        // Verify that GA tracking succeeds with correct values
        assert.ok(gh.api.utilAPI.sendTrackingEvent('category', 'action', 'label', 1), 'Verify that GA tracking succeeds with correct values');
    });


    ///////////////////
    // LOCAL STORAGE //
    ///////////////////

    // Test the 'get' functionality
    QUnit.test('get', function(assert) {

        // Stora a local test value
        gh.api.utilAPI.localDataStorage().store('foo', 'bar');

        // Verify that an error is thrown when no key was provided
        assert.throws(function() {
            gh.api.utilAPI.localDataStorage().get();
        });

        // Verify that an error is thrown when an invalid key was provided
        assert.throws(function() {
            gh.api.utilAPI.localDataStorage().get({'invalid': 'value'});
        });

        // Verify that a value can be retrieved successfully
        assert.strictEqual('bar', gh.api.utilAPI.localDataStorage().get('foo'));
    });

    // Test the 'remove' functionality
    QUnit.test('remove', function(assert) {

        // Stora a local test value
        gh.api.utilAPI.localDataStorage().store('some_crazy_key', 'some_crazy_value');

        // Verify that an error is thrown when no key was provided
        assert.throws(function() {
            gh.api.utilAPI.localDataStorage().remove();
        }, 'Verify that an error is thrown when no key was provided');

        // Verify that an error is thrown when an invalid value for key was provided
        assert.throws(function() {
            gh.api.utilAPI.localDataStorage().remove({'invalid': 'value'});
        }, 'Verify that an error is thrown when an invalid value for \'key\' was provided');

        // Verify that an entry can be removed without errors
        assert.ok('undefined', gh.api.utilAPI.localDataStorage().remove('some_crazy_key'), 'Verify that an entry can be removed without errors');
    });

    // Test the 'store' functionality
    QUnit.test('store', function(assert) {

        // Verify that an error is thrown when no key was provided
        assert.throws(function() {
            gh.api.utilAPI.localDataStorage().store(null, 'bar');
        }, 'Verify that an error is thrown when no key was provided');

        // Verify that an error is thrown when an invalid value was provided
        assert.throws(function() {
            var foo = {};
            foo.bar = foo;
            gh.api.utilAPI.localDataStorage().store('some_key', foo);
        }, 'Verify that an error is thrown when an invalid value was provided');

        // Verify that a value can be stored locally
        assert.ok('undefined', gh.api.utilAPI.localDataStorage().store('some_key', 'bar'), 'Verify that a value can be stored locally');
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

        // Verify that a notification can be triggered with a title, a message and an ID
        assert.ok(gh.api.utilAPI.notification('Notification title', 'Notification message', 'info', 'test-message'), 'Verify that a notification can be triggered with a title, a message and an ID');

        // Verify that a notification with the same ID can't be triggered
        assert.ok(!gh.api.utilAPI.notification('Notification title', 'Notification message', 'info', 'test-message'), 'Verify that a notification with the same ID can\'t be triggered');

        // Verify that a notification with the same ID won't be shown twice
        assert.ok($('#test-message').length === 1, 'Verify that a notification with the same ID won\'t be shown twice');
    });


    /////////////////
    //  TEMPLATES  //
    /////////////////

    // Test the 'renderTemplate' functionality
    QUnit.test('renderTemplate', function(assert) {
        // Add a template to the page
        $('body').append('<script id="qunit-template" type="text/template">Hi, <%- name %></script>');
        // Create the data to use in the template
        var templateData = {
            'name': 'Mathieu'
        };
        // Add a target container to the page
        $('body').append('<div id="qunit-template-target" style="display: none;"></div>');

        // Verify that a template needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.renderTemplate(null, templateData, $('#qunit-template-target'));
        }, 'Verify that a template needs to be provided');

        // Verify that template data is optional
        assert.ok(gh.api.utilAPI.renderTemplate($('#qunit-template'), null, $('#qunit-template-target')), 'Verify that template data is optional');

        // Verify that the template renders in the target container
        gh.api.utilAPI.renderTemplate($('#qunit-template'), templateData, $('#qunit-template-target'));
        assert.equal($('#qunit-template-target').text(), 'Hi, Mathieu', 'Verify the template HTML is rendered in the target container when specified');

        // Verify that the rendered HTML is returned when no target is specified
        var returnedHTML = gh.api.utilAPI.renderTemplate($('#qunit-template'), templateData);
        assert.equal(returnedHTML, 'Hi, Mathieu', 'Verify the rendered HTML returns when no target container is specified');
    });

    QUnit.test('renderTemplate - Partials', function(assert) {
        // Verify that a partial can be used to render a template
        // Add a template to the page
        $('body').append('<script id="qunit-template-partial" type="text/template"><%= _.partial(\'calendar\', {\'gh\': gh}) %></script>');
        // Create the data to use in the template
        var data = {
            'gh': gh
        };
        // Add a target container to the page
        $('body').append('<div id="qunit-template-partial-target" style="display: none;"></div>');
        // Verify that the template renders in the target container
        gh.api.utilAPI.renderTemplate($('#qunit-template-partial'), data, $('#qunit-template-partial-target'));
        assert.ok($('#qunit-template-partial-target').html(), 'Verify the template partial HTML is rendered in the target container');
    });


    ////////////////
    //  TRIPOSES  //
    ////////////////

    QUnit.asyncTest('getTriposStructure', function(assert) {
        expect(2);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.utilAPI.getTriposStructure();
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.utilAPI.getTriposStructure('invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        QUnit.start();
    });

    testAPI.init();
});
