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

define(['exports'], function(exports) {

    /**
     * Get the members of a group
     *
     * @param  {Number}      id                   The id of the group to get the members for
     * @param  {Number}      [limit]              The maximum number of results to retrieve. Default: 10
     * @param  {Number}      [offset]             The paging number of the results to retrieve
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The members of the group
     * @throws {Error}                            A parameter validation error
     */
    var getGroupMembers = exports.getGroupMembers = function(id, limit, offset, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(id)) {
            return callback({'code': 400, 'msg': 'A valid group ID should be provided'});
        } else if (limit && !_.isNumber(limit)) {
            return callback({'code': 400, 'msg': 'A valid value for limit should be provided'});
        } else if (offset && !_.isNumber(offset)) {
            return callback({'code': 400, 'msg': 'A valid value for offset should be provided'});
        }

        // Request options object
        var data = {};

        // Only add the optional parameters if they have been explicitly specified
        if (!_.isNull(limit)) {
            data['limit'] = limit;
        }
        if (!_.isNull(offset)) {
            data['offset'] = offset;
        }

        $.ajax({
            'url': '/api/groups/' + id + '/members',
            'type': 'GET',
            'data': data,
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Update the members of a group
     *
     * @param  {Number}                id              The id of the group for which to update the members
     * @param  {GroupMembersUpdate}    body            Object that describes the group member changes to apply
     * @param  {Function}              callback        Standard callback function
     * @param  {Object}                callback.err    Error object containing the error code and error message
     * @throws {Error}                                 A parameter validation error
     */
    var updateGroupMembers = exports.updateGroupMembers = function(id, body, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(id)) {
            return callback({'code': 400, 'msg': 'A valid group ID should be provided'});
        } else if (!_.isObject || $.isEmptyObject(body)) {
            return callback({'code': 400, 'msg': 'A valid value for body should be provided'});
        }

        $.ajax({
            'url': '/api/groups/' + id + '/members',
            'type': 'POST',
            'data': body,
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Lock a group
     *
     * @param  {Number}    groupId    The id of the group to lock
     * @throws {Error}                A parameter validation error
     */
    var lock = exports.lock = function(groupId) {
        /* istanbul ignore else */
        if (!_.isNumber(groupId)) {
            throw new Error('A valid group ID should be provided');
        }

        /* istanbul ignore next */
        $.ajax({
            'url': '/api/groups/' + groupId + '/lock',
            'type': 'POST',
            'error': function(jqXHR, textStatus) {
                throw new Error('The group could not be locked');
            }
        });
    };

    /**
     * Release the lock on a group
     *
     * @param  {Number}    groupId    The id of the group to release the lock from
     * @throws {Error}                A parameter validation error
     */
    var unlock = exports.unlock = function(groupId) {
        /* istanbul ignore else */
        if (!_.isNumber(groupId)) {
            throw new Error('A valid group ID should be provided');
        }

        /* istanbul ignore next */
        $.ajax({
            'url': '/api/groups/' + groupId + '/lock',
            'type': 'DELETE',
            'error': function(jqXHR, textStatus) {
                throw new Error('The group could not be unlocked');
            }
        });
    };
});
