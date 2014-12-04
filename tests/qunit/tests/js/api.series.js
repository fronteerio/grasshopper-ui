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
        expect(6);

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
                gh.api.seriesAPI.addSeriesEvents(1, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no event id was provided');

                    // Verify that an error is thrown when an invalid eventId was provided
                    gh.api.seriesAPI.addSeriesEvents(1, 'invalid_eventid', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid event id was provided');

                        // TODO: Add an event to an event series and succeed
                        // TODO: Add an event to an event series and fail

                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the `createSeries` functionality
    QUnit.asyncTest('createSeries', function(assert) {
        expect(8);

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
                gh.api.seriesAPI.createSeries(1, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no displayName was provided');

                    // Verify that an error is thrown when an invalid displayName was provided
                    gh.api.seriesAPI.createSeries(1, 123, null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

                        // Verify that an error is thrown when an invalid description was provided
                        gh.api.seriesAPI.createSeries(1, 'displayName', 123, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid description was provided');

                            // Verify that an error is thrown when an invalid groupId was provided
                            gh.api.seriesAPI.createSeries(1, 'displayName', null, 'invalid_groupid', function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid groupId was provided');

                                // Verify that an event series can be created
                                gh.api.seriesAPI.createSeries(1, 'displayName', 'Test description', null, function(err, data) {
                                    assert.ok(!err, 'Verify that an event series can be created');

                                    // TODO: Create an event series and fail

                                    QUnit.start();
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
        expect(11);

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
                gh.api.seriesAPI.cropSeriesPicture(1, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no width was provided');

                    // Verify that an error is thrown when an invalid width was provided
                    gh.api.seriesAPI.cropSeriesPicture(1, 'invalid_width', null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid width was provided');

                        // Verify that an error is thrown when no x was provided
                        gh.api.seriesAPI.cropSeriesPicture(1, 10, null, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no x was provided');

                            // Verify that an error is thrown when an invalid x was provided
                            gh.api.seriesAPI.cropSeriesPicture(1, 10, 'invalid_x', null, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid x was provided');

                                // Verify that an error is thrown when no y was provided
                                gh.api.seriesAPI.cropSeriesPicture(1, 10, 1, null, function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when no y was provided');

                                    // Verify that an error is thrown when an invalid y was provided
                                    gh.api.seriesAPI.cropSeriesPicture(1, 10, 1, 'invalid_y', function(err, data) {
                                        assert.ok(err, 'Verify that an error is thrown when an invalid y was provided');

                                        // Verify that an error is thrown when an unexisting picture is cropped
                                        gh.api.seriesAPI.cropSeriesPicture(1, 10, 1, 1, function(err, data) {
                                            assert.ok(err, 'Verify that an error is thrown when an unexisting picture is cropped');

                                            // TODO: Crop a picture and succeed
                                            // TODO: Crop a picture and fail

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

    // Test the `deleteSeries` functionality
    QUnit.asyncTest('deleteSeries', function(assert) {
        expect(3);

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

                // TODO: Delete a series and succeed
                // TODO: Delete a series and fail

                QUnit.start();
            });
        });
    });

    // Test the `deleteSeriesEvents` functionality
    QUnit.asyncTest('deleteSeriesEvents', function(assert) {
        expect(5);

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
                gh.api.seriesAPI.deleteSeriesEvents(1, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no event id was provided');

                    // Verify that an error is thrown when an invalid eventId was provided
                    gh.api.seriesAPI.deleteSeriesEvents(1, 'invalid_eventid', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid event id was provided');

                        // TODO: Delete events in a series and succeed
                        // TODO: Delete events in a series and fail

                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the `getSeries` functionality
    QUnit.asyncTest('getSeries', function(assert) {
        expect(4);

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

                // TODO: Get an event serie and succeed
                // TODO: Get an event serie and fail

                QUnit.start();
            });
        });
    });

    // Test the `getSeriesCalendar` functionality
    QUnit.asyncTest('getSeriesCalendar', function(assert) {
        expect(8);

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
                gh.api.seriesAPI.getSeriesCalendar(1, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no start was provided');

                    // Verify that an error is thrown when an invalid start was provided
                    gh.api.seriesAPI.getSeriesCalendar(1, 123, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid start was provided');

                        // Verify that an error is thrown when no end was provided
                        gh.api.seriesAPI.getSeriesCalendar(1, '2014-12-04', null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no end was provided');

                            // Verify that an error is thrown when an invalid end was provided
                            gh.api.seriesAPI.getSeriesCalendar(1, '2014-12-04', 123, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid end was provided');

                                // TODO: Get an event serie calendar and succeed
                                // TODO: Get an event serie calendar and fail

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the `getSeriesEvents` functionality
    QUnit.asyncTest('getSeriesEvents', function(assert) {
        expect(7);

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
                gh.api.seriesAPI.getSeriesEvents(1, 'invalid_limit', null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.seriesAPI.getSeriesEvents(1, null, 'invalid_offset', null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                        // Verify that an error is thrown when an invalid upcoming was provided
                        gh.api.seriesAPI.getSeriesEvents(1, null, null, 'invalid_upcoming', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid upcoming was provided');

                            // TODO: Get the events in a serie and succeed
                            // TODO: Get the events in a serie and fail

                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the `getSeriesICal` functionality
    QUnit.asyncTest('getSeriesICal', function(assert) {
        expect(6);

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
                gh.api.seriesAPI.getSeriesICal(1, 123, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid start was provided');

                    // Verify that an error is thrown when an invalid end was provided
                    gh.api.seriesAPI.getSeriesICal(1, '2014-12-04', 123, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid end was provided');

                        // TODO: Get an event serie calendar and succeed
                        // TODO: Get an event serie calendar and fail

                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the `getSeriesRSS` functionality
    QUnit.asyncTest('getSeriesRSS', function(assert) {
        expect(8);

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
                gh.api.seriesAPI.getSeriesRSS(1, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no start was provided');

                    // Verify that an error is thrown when an invalid start was provided
                    gh.api.seriesAPI.getSeriesRSS(1, 123, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid start was provided');

                        // Verify that an error is thrown when no end was provided
                        gh.api.seriesAPI.getSeriesRSS(1, '2014-12-04', null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no end was provided');

                            // Verify that an error is thrown when an invalid end was provided
                            gh.api.seriesAPI.getSeriesRSS(1, '2014-12-04', 123, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid end was provided');

                                // TODO: Get an event serie calendar and succeed
                                // TODO: Get an event serie calendar and fail

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the `getSeriesUpcoming` functionality
    QUnit.asyncTest('getSeriesUpcoming', function(assert) {
        expect(6);

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
                gh.api.seriesAPI.getSeriesUpcoming(1, 'invalid_limit', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.seriesAPI.getSeriesUpcoming(1, null, 'invalid_offset', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                        // TODO: Get the upcoming events in an event series and succeed
                        // TODO: Get the upcoming events in an event series and fail

                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the `getSeriesSubscribers` functionality
    QUnit.asyncTest('getSeriesSubscribers', function(assert) {
        expect(6);

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
                gh.api.seriesAPI.getSeriesSubscribers(1, 'invalid_limit', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.seriesAPI.getSeriesSubscribers(1, null, 'invalid_offset', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                        // TODO: Get the users that have subscribed to an event series and succeed
                        // TODO: Get the users that have subscribed to an event series and fail

                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the `setSeriesPicture` functionality
    QUnit.asyncTest('setSeriesPicture', function(assert) {
        expect(5);

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
                gh.api.seriesAPI.setSeriesPicture(1, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no file was provided');

                    // TODO: Store a picture for an event series and succeed
                    // TODO: Store a picture for an event series and fail

                    QUnit.start();
                });
            });
        });
    });

    // Test the `subscribeSeries` functionality
    QUnit.asyncTest('subscribeSeries', function(assert) {
        expect(4);

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

                // TODO: Subscribe to an event series and succeed
                // TODO: Subscribe to an event series and fail

                QUnit.start();
            });
        });
    });

    // Test the `unsubscribeSeries` functionality
    QUnit.asyncTest('unsubscribeSeries', function(assert) {
        expect(4);

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

                // TODO: Unsubscribe from an event series and succeed
                // TODO: Unsubscribe from an event series and fail

                QUnit.start();
            });
        });
    });

    // Test the `updateSeries` functionality
    QUnit.asyncTest('updateSeries', function(assert) {
        expect(6);

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
                gh.api.seriesAPI.updateSeries(1, 123, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid display name was provided');

                    // Verify that an error is thrown when an invalid description was provided
                    gh.api.seriesAPI.updateSeries(1, null, 123, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid description was provided');

                        // Verify that an error is thrown when an invalid groupId was provided
                        gh.api.seriesAPI.updateSeries(1, null, null, 'invalid_groupid', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid group id was provided');

                            // TODO: Update an event serie and succeed
                            // TODO: Update an event serie and fail

                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    testAPI.init();
});
