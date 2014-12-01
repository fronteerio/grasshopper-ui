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
     * Get the configuration schema
     *
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The configuration schema
     */
    var getConfigSchema = exports.getConfigSchema = function(callback) {
        if (!callback || (callback && !_.isFunction(callback))) {
            throw new Error('A callback function should be provided');
        }
    };

    /**
     * Get the configuration for the current app
     *
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The configuration for the current app
     */
    var getConfig = exports.getConfig = function(callback) {
        if (!callback || (callback && !_.isFunction(callback))) {
            throw new Error('A callback function should be provided');
        }
    };

    /**
     * Get the configuration for an app
     *
     * @param  {Number}      appId                The ID of the app to get the configuration for
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The configuration for the specified app
     */
    var getConfigByApp = exports.getConfigByApp = function(appId, callback) {
        if (!callback || (callback && !_.isFunction(callback))) {
            throw new Error('A callback function should be provided');
        }

        if (!appId || (appId && !_.isNumber(appId))) {
            return callback({'code': 400, 'msg': 'A valid value for appId should be provided'});
        }
    };

    /**
     * Update a configuration value for the current app
     *
     * @param  {Object}      configValues      The configuration value(s) to update. e.g., {'key1': value1, 'key2': value2}
     * @param  {Function}    [callback]        Standard callback function
     * @param  {Object}      [callback.err]    Error object containing the error code and error message
     */
    var updateConfig = exports.updateConfig = function(configValues, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        if (!configValues || (configValues && !_.isObject(configValues))) {
            return callback({'code': 400, 'msg': 'A valid value for configValues should be provided'});
        }
    };

    /**
     * Update a configuration value for an app
     *
     * @param  {Number}      appId             The ID of the app to update the configuration value(s) for
     * @param  {Object}      configValues      The configuration value(s) to update. e.g., {'key1': value1, 'key2': value2}
     * @param  {Function}    [callback]        Standard callback function
     * @param  {Object}      [callback.err]    Error object containing the error code and error message
     */
    var updateConfigByApp = exports.updateConfigByApp = function(appId, configValues, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        if (!appId || (appId && !_.isNumber(appId))) {
            return callback({'code': 400, 'msg': 'A valid value for appId should be provided'});
        } else if (!configValues || (configValues && !_.isObject(configValues))) {
            return callback({'code': 400, 'msg': 'A valid value for configValues should be provided'});
        }
    };

    /**
     * Clear a configuration value for the current app
     *
     * @param  {String[]}    configFields      Name(s) of the configuration element(s) to clear. e.g., ['key1', 'key2']
     * @param  {Function}    [callback]        Standard callback function
     * @param  {Object}      [callback.err]    Error object containing the error code and error message
     */
    var clearConfig = exports.clearConfig = function(configFields, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        if (!configFields || (configFields && !_.isArray(configFields))) {
            return callback({'code': 400, 'msg': 'A valid value for configFields should be provided'});
        }
    };

    /**
     * Clear a configuration value for an app
     *
     * @param  {Number}      appId             The ID of the app to clear the configuration value for
     * @param  {String[]}    configFields      Name(s) of the configuration element(s) to clear. e.g., ['key1', 'key2']
     * @param  {Function}    [callback]        Standard callback function
     * @param  {Object}      [callback.err]    Error object containing the error code and error message
     */
    var clearConfigByApp = exports.clearConfigByApp = function(appId, configFields, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        if (!appId || (appId && !_.isNumber(appId))) {
            return callback({'code': 400, 'msg': 'A valid value for appId should be provided'});
        } else if (!configFields || (configFields && !_.isArray(configFields))) {
            return callback({'code': 400, 'msg': 'A valid value for configFields should be provided'});
        }
    };
});
