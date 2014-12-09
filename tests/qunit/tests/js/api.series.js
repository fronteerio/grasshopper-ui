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

require(['gh.core', 'gh.api.tests', 'sinon'], function(gh, testAPI, sinon) {
    module('Series API');

    QUnit.test('init', function(assert) {
        assert.ok(true);
    });

    // Test the `addSeriesEvents` functionality
    QUnit.asyncTest('addSeriesEvents', function(assert) {
        expect(9);

        var testSeries = testAPI.getRandomSeries();

        testAPI.getRandomEvent(function(err, testEvent) {
            // Verify that an error is thrown when no callback was provided
            assert.throws(function() {
                gh.api.seriesAPI.addSeriesEvents(null, null, null);
            }, 'Verify that an error is thrown when no callback was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.seriesAPI.addSeriesEvents(null, null, 'not_a_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no seriesId was provided
            gh.api.seriesAPI.addSeriesEvents(null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no series id was provided');

                // Verify that an error is thrown when an invalid seriesId was provided
                gh.api.seriesAPI.addSeriesEvents('invalid_seriesId', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid series id was provided');

                    // Verify that an error is thrown when no eventId was provided
                    gh.api.seriesAPI.addSeriesEvents(testSeries.id, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no event id was provided');

                        // Verify that an error is thrown when an invalid eventId was provided
                        gh.api.seriesAPI.addSeriesEvents(testSeries.id, 'invalid_eventid', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid event id was provided');

                            // Verify that events can be successfully added to a series
                            // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                            var body = {'code': 200, 'msg': 'OK'};
                            gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id + '/events', 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.seriesAPI.addSeriesEvents(testSeries.id, testEvent.id, function(err, data) {
                                    assert.ok(!err, 'Verify that events can be successfully added to a series');

                                    // Verify that the error is handled
                                    body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id + '/events', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.seriesAPI.addSeriesEvents(testSeries.id, testEvent.id, function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the event can\'t be successfully added to the series');
                                            assert.ok(!data, 'Verify that no data returns when the event can\'t be successfully added to the series');

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

    // Test the `createSeries` functionality
    QUnit.asyncTest('createSeries', function(assert) {
        expect(11);

        var testApp = testAPI.getRandomApp();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.createSeries(null, null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no appId was provided
        gh.api.seriesAPI.createSeries(null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no app id was provided');

            // Verify that an error is thrown when an invalid appId was provided
            gh.api.seriesAPI.createSeries('invalid_appid', null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid app id was provided');

                // Verify that an error is thrown when no displayName was provided
                gh.api.seriesAPI.createSeries(testApp.id, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no displayName was provided');

                    // Verify that an error is thrown when an invalid displayName was provided
                    gh.api.seriesAPI.createSeries(testApp.id, 123, null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

                        // Verify that an error is thrown when an invalid description was provided
                        gh.api.seriesAPI.createSeries(testApp.id, 'displayName', 123, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid description was provided');

                            // Verify that an error is thrown when an invalid groupId was provided
                            gh.api.seriesAPI.createSeries(testApp.id, 'displayName', null, 'invalid_groupid', function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid groupId was provided');

                                // Verify that an event series can be created
                                gh.api.seriesAPI.createSeries(testApp.id, 'displayName', 'Test description', null, function(err, data) {
                                    assert.ok(!err, 'Verify that an event series can be created');

                                    // Verify that a default callback is set when none is provided and no error is thrown
                                    assert.equal(null, gh.api.seriesAPI.createSeries(testApp.id, 'displayName', 'Test description', null, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                                    // Verify that the error is handled
                                    var body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.api.utilAPI.mockRequest('POST', '/api/series', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.seriesAPI.createSeries(testApp.id, 'displayName', 'Test description', null, function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully created');
                                            assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully created');

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

    // Test the `cropSeriesPicture` functionality
    QUnit.asyncTest('cropSeriesPicture', function(assert) {
        expect(13);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.cropSeriesPicture(null, null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.cropSeriesPicture(null, null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.cropSeriesPicture(null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.cropSeriesPicture('invalid_serieid', null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when no width was provided
                gh.api.seriesAPI.cropSeriesPicture(testSeries.id, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no width was provided');

                    // Verify that an error is thrown when an invalid width was provided
                    gh.api.seriesAPI.cropSeriesPicture(testSeries.id, 'invalid_width', null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid width was provided');

                        // Verify that an error is thrown when no x was provided
                        gh.api.seriesAPI.cropSeriesPicture(testSeries.id, 10, null, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no x was provided');

                            // Verify that an error is thrown when an invalid x was provided
                            gh.api.seriesAPI.cropSeriesPicture(testSeries.id, 10, 'invalid_x', null, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid x was provided');

                                // Verify that an error is thrown when no y was provided
                                gh.api.seriesAPI.cropSeriesPicture(testSeries.id, 10, 1, null, function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when no y was provided');

                                    // Verify that an error is thrown when an invalid y was provided
                                    gh.api.seriesAPI.cropSeriesPicture(testSeries.id, 10, 1, 'invalid_y', function(err, data) {
                                        assert.ok(err, 'Verify that an error is thrown when an invalid y was provided');

                                        // Verify that pictures can be successfully cropped
                                        // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                                        var body = {'code': 200, 'msg': 'OK'};
                                        gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id + '/picture/crop', 200, {'Content-Type': 'application/json'}, body, function() {
                                            gh.api.seriesAPI.cropSeriesPicture(testSeries.id, 10, 1, 10, function(err, data) {
                                                assert.ok(!err, 'Verify that pictures can be successfully cropped');

                                                // Verify that the error is handled
                                                body = {'code': 400, 'msg': 'Bad Request'};
                                                gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id + '/picture/crop', 400, {'Content-Type': 'application/json'}, body, function() {
                                                    gh.api.seriesAPI.cropSeriesPicture(testSeries.id, 10, 1, 10, function(err, data) {
                                                        assert.ok(err, 'Verify that the error is handled when the event series picture can\'t be successfully cropped');
                                                        assert.ok(!data, 'Verify that no data returns when the event series picture can\'t be successfully cropped');

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

    // Test the `deleteSeries` functionality
    QUnit.asyncTest('deleteSeries', function(assert) {
        expect(7);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.deleteSeries(null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.deleteSeries(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.deleteSeries('invalid_serieid', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that a default callback is set when none is provided and no error is thrown
                assert.equal(null, gh.api.seriesAPI.deleteSeries(testSeries.id, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                // Verify that series can be successfully deleted
                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                var body = {'code': 200, 'msg': 'OK'};
                gh.api.utilAPI.mockRequest('DELETE', '/api/series/' + testSeries.id, 200, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.seriesAPI.deleteSeries(testSeries.id, function(err, data) {
                        assert.ok(!err, 'Verify that event series can be successfully deleted');

                        // Verify that the error is handled
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.api.utilAPI.mockRequest('DELETE', '/api/series/' + testSeries.id, 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.deleteSeries(testSeries.id, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully deleted');
                                assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully deleted');

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the `deleteSeriesEvents` functionality
    QUnit.asyncTest('deleteSeriesEvents', function(assert) {
        expect(9);

        var testSeries = testAPI.getRandomSeries();

        testAPI.getRandomEvent(function(err, testEvent) {
            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.seriesAPI.deleteSeriesEvents(null, null, 'not_a_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no serieId was provided
            gh.api.seriesAPI.deleteSeriesEvents(null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

                // Verify that an error is thrown when an invalid serieId was provided
                gh.api.seriesAPI.deleteSeriesEvents('invalid_serieid', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                    // Verify that an error is thrown when no eventId was provided
                    gh.api.seriesAPI.deleteSeriesEvents(testSeries.id, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no event id was provided');

                        // Verify that an error is thrown when an invalid eventId was provided
                        gh.api.seriesAPI.deleteSeriesEvents(testSeries.id, 'invalid_eventid', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid event id was provided');

                            // Verify that a default callback is set when none is provided and no error is thrown
                            assert.equal(null, gh.api.seriesAPI.deleteSeriesEvents(testSeries.id, testEvent.id, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                            // Verify that events can be successfully deleted from event series
                            // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                            var body = {'code': 200, 'msg': 'OK'};
                            gh.api.utilAPI.mockRequest('DELETE', '/api/series/' + testSeries.id + '/events', 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.seriesAPI.deleteSeriesEvents(testSeries.id, testEvent.id, function(err, data) {
                                    assert.ok(!err, 'Verify that events can be successfully deleted from event series');

                                    // Verify that the error is handled
                                    body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.api.utilAPI.mockRequest('DELETE', '/api/series/' + testSeries.id + '/events', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.seriesAPI.deleteSeriesEvents(testSeries.id, testEvent.id, function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the event can\'t be successfully deleted from the event series');
                                            assert.ok(!data, 'Verify that no data returns when the event can\'t be successfully deleted from the event series');

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

    // Test the `getSeries` functionality
    QUnit.asyncTest('getSeries', function(assert) {
        expect(7);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeries(null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeries(null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeries(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeries('invalid_serieid', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that event series can be successfully retrieved
                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                var body = {'code': 200, 'msg': 'OK'};
                gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id, 200, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.seriesAPI.getSeries(testSeries.id, function(err, data) {
                        assert.ok(!err, 'Verify that event series can be successfully retrieved');

                        // Verify that the error is handled
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id, 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.getSeries(testSeries.id, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully retrieved');
                                assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully retrieved');

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the `getSeriesCalendar` functionality
    QUnit.asyncTest('getSeriesCalendar', function(assert) {
        expect(11);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesCalendar(null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesCalendar(null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesCalendar(null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesCalendar('invalid_serieid', null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when no start was provided
                gh.api.seriesAPI.getSeriesCalendar(testSeries.id, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no start was provided');

                    // Verify that an error is thrown when an invalid start was provided
                    gh.api.seriesAPI.getSeriesCalendar(testSeries.id, 123, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid start was provided');

                        // Verify that an error is thrown when no end was provided
                        gh.api.seriesAPI.getSeriesCalendar(testSeries.id, '2014-12-04', null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no end was provided');

                            // Verify that an error is thrown when an invalid end was provided
                            gh.api.seriesAPI.getSeriesCalendar(testSeries.id, '2014-12-04', 123, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid end was provided');

                                // Verify that the calendar for event series can be successfully retrieved
                                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                                var body = {'code': 200, 'msg': 'OK'};
                                gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar?start=2014-12-04&end=2014-12-08', 200, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.seriesAPI.getSeriesCalendar(testSeries.id, '2014-12-04', '2014-12-08', function(err, data) {
                                        assert.ok(!err, 'Verify that the calendar for the event series can be successfully retrieved');

                                        // Verify that the error is handled
                                        body = {'code': 400, 'msg': 'Bad Request'};
                                        gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar?start=2014-12-04&end=2014-12-08', 400, {'Content-Type': 'application/json'}, body, function() {
                                            gh.api.seriesAPI.getSeriesCalendar(testSeries.id, '2014-12-04', '2014-12-08', function(err, data) {
                                                assert.ok(err, 'Verify that the error is handled when the calendar for the event series can\'t be successfully retrieved');
                                                assert.ok(!data, 'Verify that no data returns when the calendar for the event series can\'t be successfully retrieved');

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

    // Test the `getSeriesEvents` functionality
    QUnit.asyncTest('getSeriesEvents', function(assert) {
        expect(10);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesEvents(null, null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesEvents(null, null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesEvents(null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesEvents('invalid_serieid', null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid limit was provided
                gh.api.seriesAPI.getSeriesEvents(testSeries.id, 'invalid_limit', null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.seriesAPI.getSeriesEvents(testSeries.id, null, 'invalid_offset', null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                        // Verify that an error is thrown when an invalid upcoming was provided
                        gh.api.seriesAPI.getSeriesEvents(testSeries.id, null, null, 'invalid_upcoming', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid upcoming was provided');

                            // Verify that events in an event series can be successfully retrieved
                            // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                            var body = {'code': 200, 'msg': 'OK'};
                            gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/events?limit=&offset=&upcoming=', 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.seriesAPI.getSeriesEvents(testSeries.id, null, null, null, function(err, data) {
                                    assert.ok(!err, 'Verify that events in an event series can be successfully retrieved');

                                    // Verify that the error is handled
                                    body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/events?limit=&offset=&upcoming=', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.seriesAPI.getSeriesEvents(testSeries.id, null, null, null, function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the events in the event series can\'t be successfully retrieved');
                                            assert.ok(!data, 'Verify that no data returns when the events in the event series can\'t be successfully retrieved');

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

    // Test the `getSeriesICal` functionality
    QUnit.asyncTest('getSeriesICal', function(assert) {
        expect(9);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesICal(null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesICal(null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesICal(null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesICal('invalid_serieid', null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid start was provided
                gh.api.seriesAPI.getSeriesICal(testSeries.id, 123, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid start was provided');

                    // Verify that an error is thrown when an invalid end was provided
                    gh.api.seriesAPI.getSeriesICal(testSeries.id, '2014-12-04', 123, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid end was provided');

                        // Verify that events in an event series ICal feed can be successfully retrieved
                        // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                        var body = {'code': 200, 'msg': 'OK'};
                        gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar.ical?start=2014-12-04&end=2014-12-10', 200, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.getSeriesICal(testSeries.id, '2014-12-04', '2014-12-10', function(err, data) {
                                assert.ok(!err, 'Verify that events in an event series ICal feed can be successfully retrieved');

                                // Verify that the error is handled
                                body = {'code': 400, 'msg': 'Bad Request'};
                                gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar.ical?start=2014-12-04&end=2014-12-10', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.seriesAPI.getSeriesICal(testSeries.id, '2014-12-04', '2014-12-10', function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the event series ICal feed can\'t be successfully retrieved');
                                        assert.ok(!data, 'Verify that no data returns when the event series ICal feed can\'t be successfully retrieved');

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

    // Test the `getSeriesRSS` functionality
    QUnit.asyncTest('getSeriesRSS', function(assert) {
        expect(11);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesRSS(null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesRSS(null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesRSS(null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesRSS('invalid_serieid', null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when no start was provided
                gh.api.seriesAPI.getSeriesRSS(testSeries.id, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no start was provided');

                    // Verify that an error is thrown when an invalid start was provided
                    gh.api.seriesAPI.getSeriesRSS(testSeries.id, 123, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid start was provided');

                        // Verify that an error is thrown when no end was provided
                        gh.api.seriesAPI.getSeriesRSS(testSeries.id, '2014-12-04', null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no end was provided');

                            // Verify that an error is thrown when an invalid end was provided
                            gh.api.seriesAPI.getSeriesRSS(testSeries.id, '2014-12-04', 123, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid end was provided');

                                // Verify that events in an event series RSS feed can be successfully retrieved
                                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                                var body = {'code': 200, 'msg': 'OK'};
                                gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar.rss?start=2014-12-04&end=2014-12-10', 200, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.seriesAPI.getSeriesRSS(testSeries.id, '2014-12-04', '2014-12-10', function(err, data) {
                                        assert.ok(!err, 'Verify that events in an event series RSS feed can be successfully retrieved');

                                        // Verify that the error is handled
                                        body = {'code': 400, 'msg': 'Bad Request'};
                                        gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar.rss?start=2014-12-04&end=2014-12-10', 400, {'Content-Type': 'application/json'}, body, function() {
                                            gh.api.seriesAPI.getSeriesRSS(testSeries.id, '2014-12-04', '2014-12-10', function(err, data) {
                                                assert.ok(err, 'Verify that the error is handled when the event series RSS feed can\'t be successfully retrieved');
                                                assert.ok(!data, 'Verify that no data returns when the event series RSS feed can\'t be successfully retrieved');

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

    // Test the `getSeriesUpcoming` functionality
    QUnit.asyncTest('getSeriesUpcoming', function(assert) {
        expect(9);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesUpcoming(null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesUpcoming(null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesUpcoming(null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesUpcoming('invalid_serieid', null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid limit was provided
                gh.api.seriesAPI.getSeriesUpcoming(testSeries.id, 'invalid_limit', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.seriesAPI.getSeriesUpcoming(testSeries.id, null, 'invalid_offset', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                        // Verify that events the upcoming events in an event series can be successfully retrieved
                        // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                        var body = {'code': 200, 'msg': 'OK'};
                        gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/upcoming?limit=&offset=', 200, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.getSeriesUpcoming(testSeries.id, null, null, function(err, data) {
                                assert.ok(!err, 'Verify that events the upcoming events in an event series can be successfully retrieved');

                                // Verify that the error is handled
                                body = {'code': 400, 'msg': 'Bad Request'};
                                gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/upcoming?limit=&offset=', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.seriesAPI.getSeriesUpcoming(testSeries.id, null, null, function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the upcoming events in an event series can\'t be successfully retrieved');
                                        assert.ok(!data, 'Verify that no data returns when the upcoming events in an event series can\'t be successfully retrieved');

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

    // Test the `getSeriesSubscribers` functionality
    QUnit.asyncTest('getSeriesSubscribers', function(assert) {
        expect(9);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesSubscribers(null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesSubscribers(null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesSubscribers(null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesSubscribers('invalid_serieid', null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid limit was provided
                gh.api.seriesAPI.getSeriesSubscribers(testSeries.id, 'invalid_limit', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.seriesAPI.getSeriesSubscribers(testSeries.id, null, 'invalid_offset', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                        // Verify that the users that have subscribed to an event series can be successfully retrieved
                        // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                        var body = {'code': 200, 'msg': 'OK'};
                        gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/subscribers?limit=&offset=', 200, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.getSeriesSubscribers(testSeries.id, null, null, function(err, data) {
                                assert.ok(!err, 'Verify that the users that have subscribed to an event series can be successfully retrieved');

                                // Verify that the error is handled
                                body = {'code': 400, 'msg': 'Bad Request'};
                                gh.api.utilAPI.mockRequest('GET', '/api/series/' + testSeries.id + '/subscribers?limit=&offset=', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.seriesAPI.getSeriesSubscribers(testSeries.id, null, null, function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the users that have subscribed to an event series can\'t be successfully retrieved');
                                        assert.ok(!data, 'Verify that no data returns when the users that have subscribed to an event series can\'t be successfully retrieved');

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

    // Test the `setSeriesPicture` functionality
    QUnit.asyncTest('setSeriesPicture', function(assert) {
        expect(8);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.setSeriesPicture(null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.setSeriesPicture(null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.setSeriesPicture(null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.setSeriesPicture('invalid_serieid', null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when no file was provided
                gh.api.seriesAPI.setSeriesPicture(testSeries.id, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no file was provided');

                    // Verify that the event series picture can be successfully set
                    // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                    var body = {'code': 200, 'msg': 'OK'};
                    gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id + '/picture', 200, {'Content-Type': 'application/json'}, body, function() {
                        gh.api.seriesAPI.setSeriesPicture(testSeries.id, 'file placeholder', function(err, data) {
                            assert.ok(!err, 'Verify that the event series picture can be successfully set');

                            // Verify that the error is handled
                            body = {'code': 400, 'msg': 'Bad Request'};
                            gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id + '/picture', 400, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.seriesAPI.setSeriesPicture(testSeries.id, 'file placeholder', function(err, data) {
                                    assert.ok(err, 'Verify that the error is handled when the event series picture can\'t be successfully set');
                                    assert.ok(!data, 'Verify that no data returns when the event series picture can\'t be successfully set');

                                    QUnit.start();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the `subscribeSeries` functionality
    QUnit.asyncTest('subscribeSeries', function(assert) {
        expect(8);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.subscribeSeries(null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.subscribeSeries(null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.subscribeSeries(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.subscribeSeries('invalid_serieid', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that a default callback is set when none is provided and no error is thrown
                assert.equal(null, gh.api.seriesAPI.subscribeSeries(testSeries.id, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                // Verify that an event series can be successfully subscribed to
                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                var body = {'code': 200, 'msg': 'OK'};
                gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id + '/subscribe', 200, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.seriesAPI.subscribeSeries(testSeries.id, function(err, data) {
                        assert.ok(!err, 'Verify that an event series can be successfully subscribed to');

                        // Verify that the error is handled
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id + '/subscribe', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.subscribeSeries(testSeries.id, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully subscribed to');
                                assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully subscribed to');

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the `unsubscribeSeries` functionality
    QUnit.asyncTest('unsubscribeSeries', function(assert) {
        expect(8);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.unsubscribeSeries(null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.unsubscribeSeries(null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.unsubscribeSeries(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.unsubscribeSeries('invalid_serieid', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that a default callback is set when none is provided and no error is thrown
                assert.equal(null, gh.api.seriesAPI.unsubscribeSeries(testSeries.id, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                // Verify that an event series can be successfully unsubscribed from
                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                var body = {'code': 200, 'msg': 'OK'};
                gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id + '/unsubscribe', 200, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.seriesAPI.unsubscribeSeries(testSeries.id, function(err, data) {
                        assert.ok(!err, 'Verify that an event series can be successfully unsubscribed from');

                        // Verify that the error is handled
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id + '/unsubscribe', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.unsubscribeSeries(testSeries.id, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully unsubscribed from');
                                assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully unsubscribed from');

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the `updateSeries` functionality
    QUnit.asyncTest('updateSeries', function(assert) {
        expect(10);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.updateSeries(null, null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.updateSeries(null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.updateSeries('invalid_serieid', null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid displayName was provided
                gh.api.seriesAPI.updateSeries(testSeries.id, 123, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid display name was provided');

                    // Verify that an error is thrown when an invalid description was provided
                    gh.api.seriesAPI.updateSeries(testSeries.id, null, 123, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid description was provided');

                        // Verify that an error is thrown when an invalid groupId was provided
                        gh.api.seriesAPI.updateSeries(testSeries.id, null, null, 'invalid_groupid', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid group id was provided');

                            // Verify that a default callback is set when none is provided and no error is thrown
                            assert.equal(null, gh.api.seriesAPI.updateSeries(testSeries.id, null, null, null, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                            // Verify that an event series can be successfully updated
                            // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                            var body = {'code': 200, 'msg': 'OK'};
                            gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id, 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.seriesAPI.updateSeries(testSeries.id, null, null, null, function(err, data) {
                                    assert.ok(!err, 'Verify that an event series can be successfully updated');

                                    // Verify that the error is handled
                                    body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.api.utilAPI.mockRequest('POST', '/api/series/' + testSeries.id, 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.seriesAPI.updateSeries(testSeries.id, null, null, null, function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully updated');
                                            assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully updated');

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

    testAPI.init();
});
