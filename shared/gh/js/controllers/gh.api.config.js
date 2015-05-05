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

define(['exports', 'lodash'], function(exports) {

    var config = null;

    /**
     * Get the configuration for an app
     *
     * @param  {Number}      [appId]              The ID of the app you wish to retrieve configuration for. Defaults to the current app
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The configuration for the current app
     * @throws {Error}                            A parameter validation error
     */
    var getConfig = exports.getConfig = function(appId, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (appId && !_.isNumber(appId)) {
            return callback({'code': 400, 'msg': 'A valid value for appId should be provided'});
        }

        var data = {};

        // Only add the parameters to the request object if they have been explicitly specified
        /* istanbul ignore else */
        if (appId) {
            data['app'] = appId;
        }

        // Fetch the configuration from the API
        $.ajax({
            'url': '/api/config',
            'type': 'GET',
            'data': data,
            'success': function(APIConfig) {

                // Get the static configuration as well
                getStaticConfig(function(err, JSONConfig) {
                    /* istanbul ignore if */
                    if (err) {
                        return callback(err);
                    }

                    // Merge the two configurations. Note that the static configuration
                    // file will never overwrite the configuration from the back-end
                    config = _.extend(JSONConfig, APIConfig);

                    return callback(null, config);
                });
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the static configuration for all apps
     *
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The static configuration for all apps
     * @throws {Error}                            A parameter validation error
     */
    var getStaticConfig = exports.getStaticConfig = function(callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        }

        $.ajax({
            'url': '/shared/gh/files/config.json',
            'type': 'GET',
            'success': function(JSONConfig) {
                // Merge the two configurations. Note that the configuration file
                // will never overwrite the configuration from the back-end
                return callback(null, JSONConfig);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Update configuration values for an app
     *
     * @param  {Number}      [appId]           The ID of the app you wish to update configuration for. Defaults to the current app
     * @param  {Object}      configValues      The configuration value(s) to update. e.g., {'key1': value1, 'key2': value2}
     * @param  {Function}    [callback]        Standard callback function
     * @param  {Object}      [callback.err]    Error object containing the error code and error message
     * @throws {Error}                         A parameter validation error
     */
    var updateConfig = exports.updateConfig = function(appId, configValues, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        if (appId && !_.isNumber(appId)) {
            return callback({'code': 400, 'msg': 'A valid value for appId should be provided'});
        } else if (!_.isObject(configValues)) {
            return callback({'code': 400, 'msg': 'A valid value for configValues should be provided'});
        }

        // Add the appId to the configValues
        /* istanbul ignore else */
        if (appId) {
            configValues['app'] = appId;
        }

        $.ajax({
            'url': '/api/config',
            'type': 'POST',
            'data': configValues,
            'success': function(data) {
                return callback();
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the terms associated to an app
     */
    /* istanbul ignore next */
    var getAppTerm = exports.getAppTerm = function() {
        if (config && config.terms && config.academicYear) {
            return config.terms[config.academicYear];
        }
    };
});
