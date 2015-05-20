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
    module('Orgunit API');

    var testOrgUnit = null;

    QUnit.test('init', function(assert) {
        assert.ok(true);
    });

    // Test the getOrgUnits functionality
    QUnit.asyncTest('getOrgUnits', function(assert) {
        expect(9);

        var testApp = testAPI.getTestApp();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnits(testApp.id, false, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnits(testApp.id, false, null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when an invalid appId was provided
        gh.api.orgunitAPI.getOrgUnits('invalid_appid', false, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid app id was provided');

            // Verify that an error is thrown when an invalid includeSeries was provided
            gh.api.orgunitAPI.getOrgUnits(testApp.id, 'invalid_includeSeries', null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid includeSeries was provided');

                // Verify that an error is thrown when an invalid parentId was provided
                gh.api.orgunitAPI.getOrgUnits(testApp.id, false, null, 'invalid_parentid', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid parent id was provided');

                    // Verify that an error is thrown when an invalid type was provided
                    gh.api.orgunitAPI.getOrgUnits(testApp.id, false, null, 1, 123, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid type was provided');

                        // Verify that organisational units can be successfully retrieved
                        gh.api.orgunitAPI.getOrgUnits(testApp.id, false, null, null, null, function(err, data) {
                            assert.ok(!err, 'Verify that organistation units can be successfully retrieved');

                            // Verify that the error is handled when the organisational units can't be successfully retrieved
                            var body = {'code': 400, 'msg': 'Bad Request'};
                            gh.utils.mockRequest('GET', '/api/orgunit', 400, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.orgunitAPI.getOrgUnits(null, false, true, 1, 'module', function(err, data) {
                                    assert.ok(err, 'Verify that the error is handled when the organisational units can\'t be successfully retrieved');
                                    assert.ok(!data, 'Verify that no data returns when the organisational units can\'t be successfully retrieved');
                                });

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the getOrgUnitsByApp functionality

    // Test the getOrgUnit functionality
    QUnit.asyncTest('getOrgUnit', function(assert) {
        expect(8);

        var testApp = testAPI.getTestApp();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnit(testApp.id, false);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnit(testApp.id, false, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnit(null, false, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnit id was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnit('invalid_orgunit_id', false, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnit id was provided');

                // Verify that an error is thrown when an invalid includeSeries was provided
                gh.api.orgunitAPI.getOrgUnit(testApp.id, 'invalid_includeSeries', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid includeSeries was provided');

                    // Verify that an orgunit can be successfully retrieved
                    gh.api.orgunitAPI.getOrgUnit(testApp.id, false, function(err, data) {
                        assert.ok(!err, 'Verify that an orgunit can be successfully retrieved');

                        // Verify that the error is handled when the organisational unit can't be successfully retrieved
                        var body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('GET', '/api/orgunit/1', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.orgunitAPI.getOrgUnit(testApp.id, false, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the organisational unit can\'t be successfully retrieved');
                                assert.ok(!data, 'Verify that no data returns when the organisational unit can\'t be successfully retrieved');
                            });

                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the getOrgUnitSeries functionality
    QUnit.asyncTest('getOrgUnitSeries', function(assert) {
        expect(10);

        var testOrgUnit = testAPI.getRandomOrgUnit();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitSeries(testOrgUnit.id, 0, 0, true);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitSeries(testOrgUnit.id, 0, 0, true, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnitSeries(null, 0, 0, true, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnit id was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnitSeries('invalid_orgunitid', 0, 0, true, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnit id was provided');

                // Verify that an error is thrown when an invalid limit was provided
                gh.api.orgunitAPI.getOrgUnitSeries(testOrgUnit.id, 'invalid_limit', 0, true, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no limit id was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.orgunitAPI.getOrgUnitSeries(testOrgUnit.id, 0, 'invalid_offset', true, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset id was provided');

                        // Verify that an error is thrown when an invalid upcoming was provided
                        gh.api.orgunitAPI.getOrgUnitSeries(testOrgUnit.id, 0, 0, 'invalid_upcoming', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid upcoming id was provided');

                            // Verify that the series in an organisational unit can be retrieved successfully
                            gh.api.orgunitAPI.getOrgUnitSeries(testOrgUnit.id, 0, 0, true, function(err, data) {
                                assert.ok(!err, 'Verify that the series in an organisational unit can be retrieved successfully');

                                // Verify that the error is handled when the organisational unit event series can't be successfully retrieved
                                var body = {'code': 400, 'msg': 'Bad Request'};
                                gh.utils.mockRequest('GET', '/api/orgunit/' + testOrgUnit.id + '/series', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.orgunitAPI.getOrgUnitSeries(testOrgUnit.id, null, null, null, function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the organisational unit event series can\'t be successfully retrieved');
                                        assert.ok(!data, 'Verify that no data returns when the organisational unit event series can\'t be successfully retrieved');

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

    // Test the getOrgUnitCalendar functionality
    QUnit.asyncTest('getOrgUnitCalendar', function(assert) {
        expect(11);

        var testOrgUnit = testAPI.getRandomOrgUnit();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendar(testOrgUnit.id, '2014-11-30', '2014-12-1');
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendar(testOrgUnit.id, '2014-11-30', '2014-12-1', 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnitCalendar(null, '2014-11-30', '2014-12-1', function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnitCalendar('invalid_orgunitid', '2014-11-30', '2014-12-1', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when no start ISO 8601 timestamp was provided
                gh.api.orgunitAPI.getOrgUnitCalendar(testOrgUnit.id, null, '2014-12-1', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no start ISO 8601 timestamp was provided');

                    // Verify that an error is thrown when an invalid start ISO 8601 timestamp was provided
                    gh.api.orgunitAPI.getOrgUnitCalendar(testOrgUnit.id, 2014, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid start ISO 8601 timestamp was provided');

                        // Verify that an error is thrown when no end ISO 8601 timestamp was provided
                        gh.api.orgunitAPI.getOrgUnitCalendar(testOrgUnit.id, '2014-11-30', null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no end ISO 8601 timestamp was provided');

                            // Verify that an error is thrown when an invalid end ISO 8601 timestamp was provided
                            gh.api.orgunitAPI.getOrgUnitCalendar(testOrgUnit.id, '2014-11-30', 2014, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid end ISO 8601 timestamp was provided');

                                // Verify that the calendar can be successfully retrieved
                                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                                var body = {'code': 200, 'msg': 'OK'};
                                gh.utils.mockRequest('GET', '/api/orgunit/' + testOrgUnit.id + '/calendar?start=2014-11-30&end=2014-12-1', 200, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.orgunitAPI.getOrgUnitCalendar(testOrgUnit.id, '2014-11-30', '2014-12-1', function(err, data) {
                                        assert.ok(!err, 'Verify that the calendar can be successfully retrieved');

                                        // Verify that the error is handled when the calendar can't be retrieved
                                        body = {'code': 400, 'msg': 'Bad Request'};
                                        gh.utils.mockRequest('GET', '/api/orgunit/' + testOrgUnit.id + '/calendar?start=2014-11-30&end=2014-12-1', 400, {'Content-Type': 'application/json'}, body, function() {
                                            gh.api.orgunitAPI.getOrgUnitCalendar(testOrgUnit.id, '2014-11-30', '2014-12-1', function(err, data) {
                                                assert.ok(err, 'Verify that the error is handled when the calendar can\'t be successfully retrieved');
                                                assert.ok(!data, 'Verify that no data returns when the calendar can\'t be successfully retrieved');

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
    });

    // Test the getOrgUnitCalendarICal functionality
    QUnit.asyncTest('getOrgUnitCalendarICal', function(assert) {
        expect(7);

        var testOrgUnit = testAPI.getRandomOrgUnit();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendarICal(testOrgUnit.id, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendarICal(testOrgUnit.id, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnitCalendarICal(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnitCalendarICal('invalid_orgunit_id', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that the calendar can be successfully retrieved
                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                var body = {'code': 200, 'msg': 'OK'};
                gh.utils.mockRequest('GET', '/api/orgunit/' + testOrgUnit.id + '/calendar.ical', 200, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.orgunitAPI.getOrgUnitCalendarICal(testOrgUnit.id, function(err, data) {
                        assert.ok(!err, 'Verify that the calendar can be successfully retrieved');

                        // Verify that the error is handled when the calendar can't be retrieved
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('GET', '/api/orgunit/' + testOrgUnit.id + '/calendar.ical', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.orgunitAPI.getOrgUnitCalendarICal(testOrgUnit.id, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the calendar can\'t be successfully retrieved');
                                assert.ok(!data, 'Verify that no data returns when the calendar can\'t be successfully retrieved');

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the getOrgUnitCalendarRSS functionality
    QUnit.asyncTest('getOrgUnitCalendarRSS', function(assert) {
        expect(7);

        var testOrgUnit = testAPI.getRandomOrgUnit();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendarRSS(testOrgUnit.id);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendarRSS(testOrgUnit.id, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnitCalendarRSS(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnitCalendarRSS('invalid_orgunit_id', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that the calendar can be successfully retrieved
                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                var body = {'code': 200, 'msg': 'OK'};
                gh.utils.mockRequest('GET', '/api/orgunit/' + testOrgUnit.id + '/calendar.rss', 200, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.orgunitAPI.getOrgUnitCalendarRSS(testOrgUnit.id, function(err, data) {
                        assert.ok(!err, 'Verify that the calendar can be successfully retrieved');

                        // Verify that the error is handled when the calendar can't be retrieved
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('GET', '/api/orgunit/' + testOrgUnit.id + '/calendar.rss', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.orgunitAPI.getOrgUnitCalendarRSS(testOrgUnit.id, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the calendar can\'t be successfully retrieved');
                                assert.ok(!data, 'Verify that no data returns when the calendar can\'t be successfully retrieved');

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the getOrgUnitUpcoming functionality
    QUnit.asyncTest('getOrgUnitUpcoming', function(assert) {
        expect(9);

        var testOrgUnit = testAPI.getRandomOrgUnit();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitUpcoming(testOrgUnit.id, 0, 0);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitUpcoming(testOrgUnit.id, 0, 0, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnitUpcoming(null, 0, 0, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnitUpcoming('invalid_orgunit_id', 0, 0, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when an invalid limit was provided
                gh.api.orgunitAPI.getOrgUnitUpcoming(testOrgUnit.id, 'invalid_limit', 0, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.orgunitAPI.getOrgUnitUpcoming(testOrgUnit.id, 2, 'invalid_offset', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                        // Verify that the upcoming events in an organisational unit can be retrieved successfully
                        // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                        var body = {'code': 200, 'msg': 'OK'};
                        gh.utils.mockRequest('GET', '/api/orgunit/' + testOrgUnit.id + '/upcoming?limit=0&offset=0', 200, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.orgunitAPI.getOrgUnitUpcoming(testOrgUnit.id, 0, 0, function(err, data) {
                                assert.ok(!err, 'Verify that the upcoming events in an organisational unit can be retrieved successfully');

                                // Verify that the error is handled when the upcoming events in an organisational unit can't be retrieved
                                body = {'code': 400, 'msg': 'Bad Request'};
                                gh.utils.mockRequest('GET', '/api/orgunit/' + testOrgUnit.id + '/upcoming', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.orgunitAPI.getOrgUnitUpcoming(testOrgUnit.id, null, null, function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the upcoming events in an organisational unit can\'t be retrieved');
                                        assert.ok(!data, 'Verify that no data returns when the upcoming events in an organisational unit can\'t be retrieved');

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

    // Test the createOrgUnit functionality
    QUnit.asyncTest('createOrgUnit', function(assert) {
        expect(16);

        var testOrgUnit = testAPI.getRandomOrgUnit();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.createOrgUnit(testOrgUnit.id, 'displayName', 'tripos', null, null, null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no appId was provided
        gh.api.orgunitAPI.createOrgUnit(null, 'displayName', 'tripos', null, null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no app id was provided');

            // Verify that an error is thrown when an invalid appId was provided
            gh.api.orgunitAPI.createOrgUnit('invalid_appid', 'displayName', 'tripos', null, null, null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid app id was provided');

                // Verify that an error is thrown when no displayName was provided
                gh.api.orgunitAPI.createOrgUnit(testOrgUnit.id, null, null, null, null, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no displayName was provided');

                    // Verify that an error is thrown when an invalid displayName was provided
                    gh.api.orgunitAPI.createOrgUnit(testOrgUnit.id, 2, null, null, null, null, null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

                        // Verify that an error is thrown when no type was provided
                        gh.api.orgunitAPI.createOrgUnit(testOrgUnit.id, 'displayName', null, null, null, null, null, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no type was provided');

                            // Verify that an error is thrown when an invalid type was provided
                            gh.api.orgunitAPI.createOrgUnit(testOrgUnit.id, 'displayName', 3, null, null, null, null, null, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid type was provided');

                                // Verify that an error is thrown when an invalid parentId was provided
                                gh.api.orgunitAPI.createOrgUnit(testOrgUnit.id, 'displayName', 'tripos', 'invalid_parentId', null, null, null, null, function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when an invalid parentId was provided');

                                    // Verify that an error is thrown when an invalid groupId was provided
                                    gh.api.orgunitAPI.createOrgUnit(testOrgUnit.id, 'displayName', 'tripos', null, 'invalid_groupid', null, null, null, function(err, data) {
                                        assert.ok(err, 'Verify that an error is thrown when an invalid groupId was provided');

                                        // Verify that an error is thrown when an invalid description was provided
                                        gh.api.orgunitAPI.createOrgUnit(testOrgUnit.id, 'displayName', 'tripos', null, null, 123, null, null, function(err, data) {
                                            assert.ok(err, 'Verify that an error is thrown when an invalid description was provided');

                                            // Verify that an error is thrown when an invalid value for metadata was provided
                                            gh.api.orgunitAPI.createOrgUnit(testOrgUnit.id, 'displayName', 'tripos', null, null, null, 'invalid_metadata', null, function(err, data) {
                                                assert.ok(err, 'Verify that an error is thrown when an invalid value for metadata was provided');

                                                // Verify that an error is thrown when an invalid value for visibility was provided
                                                gh.api.orgunitAPI.createOrgUnit(testOrgUnit.id, 'displayName', 'tripos', null, null, null, null, 999999, function(err, data) {
                                                    assert.ok(err, 'Verify that an error is thrown when an invalid value for visibility was provided');

                                                    // Verify that an error is thrown when creating an orgunit in a non-existing app
                                                    gh.api.orgunitAPI.createOrgUnit(9999999, 'displayName', 'tripos', null, null, null, null, null, function(err, data) {
                                                        assert.ok(err, 'Verify that an error is thrown when creating an orgunit in a non-existing app');

                                                        // Verify that an organisational unit can be successfully created
                                                        var testApp = testAPI.getApps()[0];
                                                        gh.api.orgunitAPI.createOrgUnit(parseInt(testApp.id, 10), 'displayName', 'tripos', null, null, null, null, null, function(err, data) {
                                                            assert.ok(!err, 'Verify that an organisational unit can be successfully created');

                                                            // Verify that an organisational unit can be successfully created when all the parameters are provided
                                                            gh.api.orgunitAPI.createOrgUnit(parseInt(testApp.id, 10), 'displayName', 'tripos', data.id, data.GroupId, 'some description', {'foo': 'bar'}, false, function(err, data) {
                                                                assert.ok(!err, 'Verify that an organisational unit can be successfully created when all the parameters are provided');

                                                                // Verify that a default callback is set when none is provided and no error is thrown
                                                                assert.equal(null, gh.api.orgunitAPI.createOrgUnit(parseInt(testApp.id, 10), 'displayName', 'tripos', null, null, null, null, null, null), 'Verify that a default callback is set when none is provided and no error is thrown');

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
                    });
                });
            });
        });
    });

    // Test the createOrgUnitByApp functionality

    // Test the updateOrgUnit functionality
    QUnit.asyncTest('updateOrgUnit', function(assert) {
        expect(14);

        var testOrgUnit = testAPI.getRandomOrgUnit();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.updateOrgUnit(testOrgUnit.id, 'description', 'displayName', null, null, null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.updateOrgUnit(null, 'description', 'displayName', null, null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.updateOrgUnit('invalid_orgunit_id', 'description', 'displayName', null, null, null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when an invalid description was provided
                gh.api.orgunitAPI.updateOrgUnit(testOrgUnit.id, 123, 'displayName', null, null, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid description was provided');

                    // Verify that an error is thrown when an invalid displayName was provided
                    gh.api.orgunitAPI.updateOrgUnit(testOrgUnit.id, 'description', 123, null, null, null, null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

                        // Verify that an error is thrown when an invalid groupId was provided
                        gh.api.orgunitAPI.updateOrgUnit(testOrgUnit.id, 'description', 'displayName', 'invalid_group_id', null, null, null, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid groupId was provided');

                            // Verify that an error is thrown when an invalid parentId was provided
                            gh.api.orgunitAPI.updateOrgUnit(testOrgUnit.id, 'description', 'displayName', null, 'invalid_parent_id', null, null, null, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid parentId was provided');

                                // Verify that an error is thrown when an invalid type was provided
                                gh.api.orgunitAPI.updateOrgUnit(testOrgUnit.id, 'description', 'displayName', null, null, 123, null, null, function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when an invalid type was provided');

                                    // Verify that an error is thrown when an invalid value for metadata was provided
                                    gh.api.orgunitAPI.updateOrgUnit(testOrgUnit.id, 'description', 'displayName', null, null, null, 'invalid_metadata', null, function(err, data) {
                                        assert.ok(err, 'Verify that an error is thrown when an invalid value for metadata was provided');

                                        // Verify that an error is thrown when an invalid value for visibility was provided
                                        gh.api.orgunitAPI.updateOrgUnit(testOrgUnit.id, 'description', 'displayName', null, null, null, null, 123, function(err, data) {
                                            assert.ok(err, 'Verify that an error is thrown when an invalid value for visibility was provided');

                                            // Verify that a default callback is set when none is provided and no error is thrown
                                            assert.equal(null, gh.api.orgunitAPI.updateOrgUnit(testOrgUnit.id, 'description', 'displayName', null, null, null, null, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                                            // Verify that the organisational unit can be updated when all the parameters have been specified
                                            gh.api.orgunitAPI.updateOrgUnit(testOrgUnit.id, 'description', 'displayName', 1, 1, 'part', {'foo': 'bar'}, true, function(err, data) {
                                                assert.ok(!err, 'Verify that the organisational unit can be updated successfully');

                                                // Verify that the error is handled when the organisational unit could not be successfully updated
                                                body = {'code': 400, 'msg': 'Bad Request'};
                                                gh.utils.mockRequest('POST', '/api/orgunit/' + testOrgUnit.id, 400, {'Content-Type': 'application/json'}, body, function() {
                                                    gh.api.orgunitAPI.updateOrgUnit(testOrgUnit.id, null, null, null, null, null, null, null, function(err, data) {
                                                        assert.ok(err, 'Verify that the error is handled when the organisational unit could not be successfully updated');
                                                        assert.ok(!data, 'Verify that no data returns when the organisational unit could not be successfully updated');

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
            });
        });
    });

    // Test the addOrgUnitSeries functionality
    QUnit.asyncTest('addOrgUnitSeries', function(assert) {
        expect(9);

        var testOrgUnit = testAPI.getRandomOrgUnit();
        var testSeries = testAPI.getRandomSeries();

        testAPI.getRandomEvent(function(err, testEvent) {
            // Verify that an error is thrown when no callback was provided
            assert.throws(function() {
                gh.api.orgunitAPI.addOrgUnitSeries(testOrgUnit.id, testSeries.id, null);
            }, 'Verify that an error is thrown when no callback was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.orgunitAPI.addOrgUnitSeries(testOrgUnit.id, testSeries.id, 'not_a_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no orgUnitId was provided
            gh.api.orgunitAPI.addOrgUnitSeries(null, testSeries.id, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

                // Verify that an error is thrown when an invalid orgUnitId was provided
                gh.api.orgunitAPI.addOrgUnitSeries('invalid_orgunit_id', testSeries.id, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                    // Verify that an error is thrown when no serieId was provided
                    gh.api.orgunitAPI.addOrgUnitSeries(testOrgUnit.id, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no serieId was provided');

                        // Verify that an error is thrown when an invalid serieId was provided
                        gh.api.orgunitAPI.addOrgUnitSeries(testOrgUnit.id, 'invalid_event_id', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid serieId was provided');

                            // Verify that an event series can be added to an organisational unit
                            var body = {'code': 200, 'msg': 'OK'};
                            gh.utils.mockRequest('POST', '/api/orgunit/' + testOrgUnit.id + '/series', 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.orgunitAPI.addOrgUnitSeries(testOrgUnit.id, testEvent.id, function(err, data) {
                                    assert.ok(!err, 'Verify that an event series can be added to an organisational unit');

                                    // Verify that the error is handled when the event could not be successfully added to the organisational unit
                                    body = {'code': 400, 'msg': 'One or more of the specified events are not part of the organisational unit'};
                                    gh.utils.mockRequest('POST', '/api/orgunit/' + testOrgUnit.id + '/series', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.orgunitAPI.addOrgUnitSeries(testOrgUnit.id, testEvent.id, function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the event series could not be successfully added to the organisational unit');
                                            assert.ok(!data, 'Verify that no data returns when the event series could not be successfully added to the organisational unit');

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

    // Test the addOrgUnitEvent functionality
    QUnit.asyncTest('addOrgUnitEvent', function(assert) {
        expect(9);

        var testOrgUnit = testAPI.getRandomOrgUnit();
        testAPI.getRandomEvent(function(err, testEvent) {
            // Verify that an error is thrown when no callback was provided
            assert.throws(function() {
                gh.api.orgunitAPI.addOrgUnitEvent(testOrgUnit.id, testEvent.id, null);
            }, 'Verify that an error is thrown when no callback was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.orgunitAPI.addOrgUnitEvent(testOrgUnit.id, testEvent.id, 'not_a_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no orgUnitId was provided
            gh.api.orgunitAPI.addOrgUnitEvent(null, testEvent.id, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

                // Verify that an error is thrown when an invalid orgUnitId was provided
                gh.api.orgunitAPI.addOrgUnitEvent('invalid_orgunit_id', testEvent.id, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                    // Verify that an error is thrown when no eventId was provided
                    gh.api.orgunitAPI.addOrgUnitEvent(testOrgUnit.id, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no eventId was provided');

                        // Verify that an error is thrown when an invalid eventId was provided
                        gh.api.orgunitAPI.addOrgUnitEvent(testOrgUnit.id, 'invalid_event_id', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid eventId was provided');

                            // Verify that an event can be successfully added to an organisational unit
                            var body = {'code': 200, 'msg': 'OK'};
                            gh.utils.mockRequest('POST', '/api/orgunit/' + testOrgUnit.id + '/events', 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.orgunitAPI.addOrgUnitEvent(testOrgUnit.id, testEvent.id, function(err, data) {
                                    assert.ok(!err, 'Verify that an event can be successfully added to an organisational unit');

                                    // Verify that the error is handled when the event could not be successfully added to the organisational unit
                                    body = {'code': 400, 'msg': 'One or more of the specified events are not part of the organisational unit'};
                                    gh.utils.mockRequest('POST', '/api/orgunit/' + testOrgUnit.id + '/events', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.orgunitAPI.addOrgUnitEvent(testOrgUnit.id, testEvent.id, function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the event could not be successfully added to the organisational unit');
                                            assert.ok(!data, 'Verify that no data returns when the event could not be successfully added to the organisational unit');

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

    // Test the deleteOrgUnitSeries functionality
    QUnit.asyncTest('deleteOrgUnitSeries', function(assert) {
        expect(9);

        var testOrgUnit = testAPI.getRandomOrgUnit();
        var testSeries = testOrgUnit.Series[0];

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.deleteOrgUnitSeries(testOrgUnit.id, testSeries.id, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.deleteOrgUnitSeries(null, testSeries.id, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.deleteOrgUnitSeries('invalid_orgunit_id', null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when no serieId was provided
                gh.api.orgunitAPI.deleteOrgUnitSeries(testOrgUnit.id, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no serieId was provided');

                    // Verify that an error is thrown when an invalid serieId was provided
                    gh.api.orgunitAPI.deleteOrgUnitSeries(testOrgUnit.id, 'invalid_series_id', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid serieId was provided');

                        // Verify that a default callback is set when none is provided and no error is thrown
                        assert.equal(null, gh.api.orgunitAPI.deleteOrgUnitSeries(testOrgUnit.id, testSeries.id, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                        // Verify that an event series can be successfully deleted from an organisational unit
                        // We need to mock this as phantomjs doesn't support sending Arrays as part of the body in a DELETE operation
                        var body = {'code': 200, 'msg': 'OK'};
                        gh.utils.mockRequest('DELETE', '/api/orgunit/' + testOrgUnit.id + '/series', 200, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.orgunitAPI.deleteOrgUnitSeries(testOrgUnit.id, testSeries.id, function(err, data) {
                                assert.ok(!err, 'Verify that an event series can be successfully deleted from an organisational unit');

                                // Verify that the error is handled when the event series could not be successfully deleted from the organisational unit
                                body = {'code': 400, 'msg': 'One or more of the specified series are not part of the organisational unit'};
                                gh.utils.mockRequest('DELETE', '/api/orgunit/' + testOrgUnit.id + '/series', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.orgunitAPI.deleteOrgUnitSeries(testOrgUnit.id, testSeries.id, function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the event series could not be successfully deleted from the organisational unit');
                                        assert.ok(!data, 'Verify that no data returns when the event series could not be successfully deleted from the organisational unit');

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

    // Test the deleteOrgUnitEvent functionality
    QUnit.asyncTest('deleteOrgUnitEvent', function(assert) {
        expect(9);

        var testOrgUnit = testAPI.getRandomOrgUnit();
        var testSeries = testOrgUnit.Series[0];

        testAPI.getRandomEvent(function(err, testEvent) {
            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.orgunitAPI.deleteOrgUnitEvent(testOrgUnit.id, testEvent.id, 'not_a_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no orgUnitId was provided
            gh.api.orgunitAPI.deleteOrgUnitEvent(null, testEvent.id, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

                // Verify that an error is thrown when an invalid orgUnitId was provided
                gh.api.orgunitAPI.deleteOrgUnitEvent('invalid_orgunit_id', testEvent.id, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                    // Verify that an error is thrown when no eventId was provided
                    gh.api.orgunitAPI.deleteOrgUnitEvent(testOrgUnit.id, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no eventId was provided');

                        // Verify that an error is thrown when an invalid eventId was provided
                        gh.api.orgunitAPI.deleteOrgUnitEvent(testOrgUnit.id, 'invalid_event_id', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid eventId was provided');

                            // Verify that a default callback is set when none is provided and no error is thrown
                            assert.equal(null, gh.api.orgunitAPI.deleteOrgUnitEvent(testOrgUnit.id, testEvent.id, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                            // Verify that an event can be successfully deleted from an organisational unit
                            // We need to mock this as phantomjs doesn't support sending Arrays as part of the body in a DELETE operation
                            var body = {'code': 200, 'msg': 'OK'};
                            gh.utils.mockRequest('DELETE', '/api/orgunit/' + testOrgUnit.id + '/events', 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.orgunitAPI.deleteOrgUnitEvent(testOrgUnit.id, testEvent.id, function(err, data) {
                                    assert.ok(!err, 'Verify that an event can be successfully deleted from an organisational unit');

                                    // Verify that the error is handled when the event could not be successfully deleted from the organisational unit
                                    body = {'code': 400, 'msg': 'One or more of the specified events are not part of the organisational unit'};
                                    gh.utils.mockRequest('DELETE', '/api/orgunit/' + testOrgUnit.id + '/events', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.orgunitAPI.deleteOrgUnitEvent(testOrgUnit.id, testEvent.id, function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the event could not be successfully deleted from the organisational unit');
                                            assert.ok(!data, 'Verify that no data returns when the event could not be successfully deleted from the organisational unit');

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

    // Test the deleteOrgUnit functionality
    QUnit.asyncTest('deleteOrgUnit', function(assert) {
        expect(7);

        var testOrgUnit = testAPI.getRandomOrgUnit();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.deleteOrgUnit(1, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.deleteOrgUnit(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.deleteOrgUnit('invalid_orgunit_id', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that a default callback is set when none is provided and no error is thrown
                assert.equal(null, gh.api.orgunitAPI.deleteOrgUnit(1), 'Verify that a default callback is set when none is provided and no error is thrown');

                // Verify that an organisational unit can be successfully deleted
                // We need to mock this as phantomjs doesn't support sending Arrays as part of the body in a DELETE operation
                var body = {'code': 200, 'msg': 'OK'};
                gh.utils.mockRequest('DELETE', '/api/orgunit/' + testOrgUnit.id, 200, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.orgunitAPI.deleteOrgUnit(testOrgUnit.id, function(err, data) {
                        assert.ok(!err, 'Verify that an organisational unit can be successfully deleted');

                        // Verify that the error is handled when the organisational unit could not be successfully updated
                        body = {'code': 400, 'msg': 'One or more of the specified events are not part of the organisational unit'};
                        gh.utils.mockRequest('DELETE', '/api/orgunit/' + testOrgUnit.id, 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.orgunitAPI.deleteOrgUnit(testOrgUnit.id, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the organisational unit could not be successfully deleted');
                                assert.ok(!data, 'Verify that no data returns when the organisational unit could not be successfully deleted');

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the subscribeOrgUnit functionality
    QUnit.asyncTest('subscribeOrgUnit', function(assert) {
        expect(7);

        var testOrgUnit = testAPI.getRandomOrgUnit();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.subscribeOrgUnit(1, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.subscribeOrgUnit(null, function(err) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.subscribeOrgUnit('invalid_orgunit_id', function(err) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when an orgunit that doesn't exist is being subscribed to
                gh.api.orgunitAPI.subscribeOrgUnit(99999999, function(err) {
                    assert.ok(err, 'Verify that an error is thrown when an orgunit that doesn\'t exist is being subscribed to');

                    // Verify that a default callback is set when none is provided and no error is thrown
                    assert.equal(null, gh.api.orgunitAPI.subscribeOrgUnit(99999999, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                    // Verify that an organisational unit can be successfully subscribed to
                    gh.api.orgunitAPI.subscribeOrgUnit(testOrgUnit.id, function(err) {
                        assert.ok(!err, 'Verify that an organisational unit can be successfully subscribed to');

                        // Verify that the error is handled when an an organisational unit cannot be successfully subscribed to
                        gh.api.orgunitAPI.subscribeOrgUnit(99999999, function(err) {
                            assert.ok(err, 'Verify that the error is handled when an an organisational unit cannot be successfully subscribed to');

                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the unsubscribeOrgUnit functionality
    QUnit.asyncTest('unsubscribeOrgUnit', function(assert) {
        expect(7);

        var testOrgUnit = testAPI.getRandomOrgUnit();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.unsubscribeOrgUnit(1, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.unsubscribeOrgUnit(null, function(err) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.unsubscribeOrgUnit('invalid_orgunit_id', function(err) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when an orgunit that doesn't exist is being subscribed to
                gh.api.orgunitAPI.unsubscribeOrgUnit(99999999, function(err) {
                    assert.ok(err, 'Verify that an error is thrown when an orgunit that doesn\'t exist is being subscribed to');

                    // Verify that a default callback is set when none is provided and no error is thrown
                    assert.equal(null, gh.api.orgunitAPI.unsubscribeOrgUnit(99999999, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                    // Verify that an organisational unit can be successfully unsubscribed from
                    gh.api.orgunitAPI.unsubscribeOrgUnit(testOrgUnit.id, function(err) {
                        assert.ok(!err, 'Verify that an organisational unit can be successfully unsubscribed from');

                        // Verify that the error is handled when an an organisational unit cannot be successfully unsubscribed from
                        gh.api.orgunitAPI.unsubscribeOrgUnit(99999999, function(err) {
                            assert.ok(err, 'Verify that the error is handled when an an organisational unit cannot be successfully unsubscribed from');

                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    testAPI.init();
});
