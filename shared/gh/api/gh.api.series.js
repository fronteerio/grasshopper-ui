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

define(['exports'], function(exports) {

    /**
     * Add an event to an event series
     *
     * @param  {Number}      serieId              The ID of the event series to add an event to
     * @param  {Number[]}    eventId              The ID of the event to add to an event series
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object representing the added event
     */
    var addSeriesEvents = exports.addSeriesEvents = function(serieId, eventId, callback) {
        if (!_.isFunction(callback)) {
             throw new Error('A callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid series ID should be provided'});
        } else if (!_.isNumber(eventId)) {
            return callback({'code': 400, 'msg': 'A valid event ID should be provided'});
        }

        $.ajax({
            'url': '/api/series/' + serieId + '/events',
            'type': 'POST',
            'data': {
                'events': eventId
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Create a new event series in an app
     *
     * @param  {Number}      appId                  The ID of the app to create the event series for
     * @param  {String}      displayName            The name of the event series
     * @param  {String}      [description]          The description of the event series
     * @param  {Number}      [group]                The ID of the group that can manage the event series. Defaults to creating a new group with the current user as a member
     * @param  {Function}    [callback]             Standard callback function
     * @param  {Object}      [callback.err]         Error object containing the error code and error message
     * @param  {Object}      [callback.response]    Object representing the created event series
     */
    var createSeries = exports.createSeries = function(appId, displayName, description, groupId, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A valid callback function should be provided');
        } else if (!_.isNumber(appId)) {
            return callback({'code': 400, 'msg': 'A valid app ID should be provided'});
        } else if (!_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid display name should be provided'});
        } else if (description && !_.isString(description)) {
            return callback({'code': 400, 'msg': 'A valid description should be provided'});
        } else if (groupId && !_.isNumber(groupId)) {
            return callback({'code': 400, 'msg': 'A valid groupId should be provided'});
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/series',
            'type': 'POST',
            'data': {
                'app': appId,
                'displayName': displayName,
                'description': description,
                'group': groupId
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Crop the picture for an event series
     *
     * @param  {Number}      serieId              The ID of the series to crop the picture for
     * @param  {Number}      width                The width of the square that needs to be cropped out
     * @param  {Number}      x                    The x coordinate of the top left corner to start cropping at
     * @param  {Number}      y                    The y coordinate of the top left corner to start cropping at
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object representing the cropped picture
     */
    var cropSeriesPicture = exports.cropSeriesPicture = function(serieId, width, x, y, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid series ID should be provided'});
        } else if (!_.isNumber(width)) {
            return callback({'code': 400, 'msg': 'A valid width should be provided'});
        } else if (!_.isNumber(x)) {
            return callback({'code': 400, 'msg': 'A valid x should be provided'});
        } else if (!_.isNumber(y)) {
            return callback({'code': 400, 'msg': 'A valid y should be provided'});
        }

        $.ajax({
            'url': '/api/series/' + serieId + '/picture/crop',
            'type': 'POST',
            'data': {
                'width': width,
                'x': x,
                'y': y
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Delete an event series
     *
     * @param  {Number}      serieId                The ID of the event series to delete
     * @param  {Function}    [callback]             Standard callback function
     * @param  {Object}      [callback.err]         Error object containing the error code and error message
     * @param  {Object}      [callback.response]    Object representing the deleted event series
     */
    var deleteSeries = exports.deleteSeries = function(serieId, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A valid callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid series ID should be provided'});
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/series/' + serieId,
            'type': 'DELETE',
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Remove an event from an event series
     *
     * @param  {Number}      serieId                The ID of the event series to remove an event from
     * @param  {Number}      eventId                The ID of the event to remove from the event series
     * @param  {Function}    [callback]             Standard callback function
     * @param  {Object}      [callback.err]         Error object containing the error code and error message
     * @param  {Object}      [callback.response]    Object representing the deleted event
     */
    var deleteSeriesEvents = exports.deleteSeriesEvents = function(serieId, eventId, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A valid callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid series ID should be provided'});
        } else if (!_.isNumber(eventId)) {
            return callback({'code': 400, 'msg': 'A valid event ID should be provided'});
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/series/' + serieId + '/events',
            'type': 'DELETE',
            'data': {
                'events': eventId
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get an event series
     *
     * @param  {Number}      serieId              The ID of the event series to retrieve
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object representing the event series
     */
    var getSeries = exports.getSeries = function(serieId, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid series ID should be provided'});
        }

        $.ajax({
            'url': '/api/series/' + serieId,
            'type': 'GET',
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the calendar for an event series
     *
     * @param  {Number}      serieId              The ID of the series to retrieve the calendar for
     * @param  {String}      start                The timestamp (ISO 8601) from which to get the calendar for the event series
     * @param  {String}      end                  The timestamp (ISO 8601) until which to get the calendar for the event series
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object representing the calendar
     */
    var getSeriesCalendar = exports.getSeriesCalendar = function(serieId, start, end, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid serieId should be provided'});
        } else if (!_.isString(start)) {
            return callback({'code': 400, 'msg': 'A valid start should be provided'});
        } else if (!_.isString(end)) {
            return callback({'code': 400, 'msg': 'A valid end should be provided'});
        }

        $.ajax({
            'url': '/api/series/' + serieId + '/calendar',
            'type': 'GET',
            'data': {
                'start': start,
                'end': end
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the events in an event series
     *
     * @param  {Number}      serieId              The ID of the series to retrieve the events for
     * @param  {Number}      [limit]              The maximum number of results to retrieve. Defaults to 10
     * @param  {Number}      [offset]             The paging number of the results to retrieve
     * @param  {Boolean}     [upcoming]           Whether to only include upcoming events. Defaults to `true`
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object representing the events in an event series
     */
    var getSeriesEvents = exports.getSeriesEvents = function(serieId, limit, offset, upcoming, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid serieId should be provided'});
        } else if (limit && !_.isNumber(limit)) {
            return callback({'code': 400, 'msg': 'A valid limit should be provided'});
        } else if (offset && !_.isNumber(offset)) {
            return callback({'code': 400, 'msg': 'A valid offset should be provided'});
        } else if (upcoming && !_.isBoolean(upcoming)) {
            return callback({'code': 400, 'msg': 'A valid upcoming should be provided'});
        }

        $.ajax({
            'url': '/api/series/' + serieId + '/events',
            'type': 'GET',
            'data': {
                'limit': limit,
                'offset': offset,
                'upcoming': upcoming
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the calendar for an event series in iCal
     *
     * @param  {Number}      serieId              The ID of the series to retrieve the iCal calendar for
     * @param  {String}      [start]              The timestamp (ISO 8601) from which to get the calendar for the event series
     * @param  {String}      [end]                The timestamp (ISO 8601) until which to get the calendar for the event series
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object representing the iCal calendar
     */
    var getSeriesICal = exports.getSeriesICal = function(serieId, start, end, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid serieId should be provided'});
        } else if (start && !_.isString(start)) {
            return callback({'code': 400, 'msg': 'A valid start should be provided'});
        } else if (end && !_.isString(end)) {
            return callback({'code': 400, 'msg': 'A valid end should be provided'});
        }

        $.ajax({
            'url': '/api/series/' + serieId + '/calendar.ical',
            'type': 'GET',
            'data': {
                'start': start,
                'end': end
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the calendar for an event series in RSS
     *
     * @param  {Number}      serieId              The ID of the series to retrieve the RSS feed for
     * @param  {String}      start                The timestamp (ISO 8601) from which to get the calendar for the event series
     * @param  {String}      end                  The timestamp (ISO 8601) until which to get the calendar for the event series
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object representing the RSS feed
     */
    var getSeriesRSS = exports.getSeriesRSS = function(serieId, start, end, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid serieId should be provided'});
        } else if (!_.isString(start)) {
            return callback({'code': 400, 'msg': 'A valid start should be provided'});
        } else if (!_.isString(end)) {
            return callback({'code': 400, 'msg': 'A valid end should be provided'});
        }

        $.ajax({
            'url': '/api/series/' + serieId + '/calendar.rss',
            'type': 'GET',
            'data': {
                'start': start,
                'end': end
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the upcoming events in an event series
     *
     * @param  {Number}      serieId              The ID of the series to retrieve the upcoming events for
     * @param  {Number}      [limit]              The maximum number of results to retrieve. Defaults to 10
     * @param  {Number}      [offset]             The paging number of the results to retrieve
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object representing the upcoming events in an event series
     */
    var getSeriesUpcoming = exports.getSeriesUpcoming = function(serieId, limit, offset, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid serieId should be provided'});
        } else if (limit && !_.isNumber(limit)) {
            return callback({'code': 400, 'msg': 'A valid limit should be provided'});
        } else if (offset && !_.isNumber(offset)) {
            return callback({'code': 400, 'msg': 'A valid offset should be provided'});
        }

        $.ajax({
            'url': '/api/series/' + serieId + '/upcoming',
            'type': 'GET',
            'data': {
                'limit': limit,
                'offset': offset
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the users that have subscribed to an event series
     *
     * @param  {Number}      serieId              The ID of the series to retrieve users that subscribed
     * @param  {Number}      [limit]              The maximum number of results to retrieve. Defaults to 10
     * @param  {Number}      [offset]             The paging number of the results to retrieve
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object representing the users that have subscribed to an event series
     */
    var getSeriesSubscribers = exports.getSeriesSubscribers = function(serieId, limit, offset, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid serieId should be provided'});
        } else if (limit && !_.isNumber(limit)) {
            return callback({'code': 400, 'msg': 'A valid limit should be provided'});
        } else if (offset && !_.isNumber(offset)) {
            return callback({'code': 400, 'msg': 'A valid offset should be provided'});
        }

        $.ajax({
            'url': '/api/series/' + serieId + '/subscribers',
            'type': 'GET',
            'data': {
                'limit': limit,
                'offset': offset
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Store a picture for an event series
     *
     * @param  {Number}     serieId              The ID of the series to store a picture for
     * @param  {Form}       file                 Image that should be stored as the event series picture
     * @param  {Function}   callback             Standard callback function
     * @param  {Object}     callback.err         Error object containing the error code and error message
     * @param  {Object}     callback.response    Object representing the picture for an event series
     */
    var setSeriesPicture = exports.setSeriesPicture = function(serieId, file, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid serieId should be provided'});
        } else if (_.isEmpty(file)) {
            return callback({'code': 400, 'msg': 'A valid file should be provided'});
        }

        $.ajax({
            'url': '/api/series/' + serieId + '/picture',
            'type': 'POST',
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Subscribe to an event series
     *
     * @param  {Number}      serieId                The ID of the series to subscribe to
     * @param  {Number}      [userId]               The ID of the user that should be subscribed. Defaults to the current user
     * @param  {Number}      [context]              The ID of the organisational unit to which the serie belongs
     * @param  {Function}    [callback]             Standard callback function
     * @param  {Object}      [callback.err]         Error object containing the error code and error message
     * @param  {Object}      [callback.response]    Object representing the subscribed to event series
     */
    var subscribeSeries = exports.subscribeSeries = function(serieId, userId, context, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A valid callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid serieId should be provided'});
        } else if (userId && !_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid userId should be provided'});
        } else if (context && !_.isNumber(context)) {
            return callback({'code': 400, 'msg': 'A valid context should be provided'});
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/series/' + serieId + '/subscribe',
            'type': 'POST',
            'data': {
                'userId': userId,
                'context': context
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Unsubscribe from an event series
     *
     * @param  {Number}      serieId                The ID of the series to unsubscribe from
     * @param  {Function}    [callback]             Standard callback function
     * @param  {Object}      [callback.err]         Error object containing the error code and error message
     * @param  {Object}      [callback.response]    Object representing the unsubscribed from event series
     */
    var unsubscribeSeries = exports.unsubscribeSeries = function(serieId, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A valid callback function should be provided');
        } else if (!_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid serieId should be provided'});
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/series/' + serieId + '/unsubscribe',
            'type': 'POST',
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Update an event series
     *
     * @param  {Number}      serieId                The ID of the series to update
     * @param  {String}      [displayName]          The updated event series name
     * @param  {String}      [description]          The updated event series description
     * @param  {Number}      [groupId]              The updated ID of the group that can manage the event series
     * @param  {Function}    [callback]             Standard callback function
     * @param  {Object}      [callback.err]         Error object containing the error code and error message
     * @param  {Object}      [callback.response]    Object representing the updated event series
     */
    var updateSeries = exports.updateSeries = function(serieId, displayName, description, groupId, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A valid callback function should be provided');
        } else if (serieId && !_.isNumber(serieId)) {
            return callback({'code': 400, 'msg': 'A valid serieId should be provided'});
        } else if (displayName && !_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid display name should be provided'});
        } else if (description && !_.isString(description)) {
            return callback({'code': 400, 'msg': 'A valid description should be provided'});
        } else if (groupId && !_.isNumber(groupId)) {
            return callback({'code': 400, 'msg': 'A valid groupId should be provided'});
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/series/' + serieId,
            'type': 'POST',
            'data': {
                'description': description,
                'displayName': displayName,
                'group': groupId
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };
});
