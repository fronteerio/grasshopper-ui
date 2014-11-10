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
     * Clear a configuration value for an app
     *
     * @param  {Number}      appId           The ID of the app to clear the configuration value for
     * @param  {String[]}    configFields    Name(s) of the configuration element(s) to clear. e.g., ['key1', 'key2']
     * @param  {Function}    [callback]      Standard callback function
     */
    var clearConfig = exports.clearConfig = function(appId, configFields, callback) {

    };

    /**
     * Get the configuration for an app
     *
     * @param  {Number}      appId       The ID of the app to get the configuration for
     * @param  {Function}    callback    Standard callback function
     */
    var getConfig = exports.getConfig = function(appId, callback) {

    };

    /**
     * Get the configuration schema
     *
     * @param  {Function}    callback    Standard callback function
     */
    var getConfigSchema = exports.getConfigSchema = function(callback) {

    };

    /**
     * Update a configuration value for an app
     *
     * @param  {Number}      appId            The ID of the app to update the configuration value(s) for
     * @param  {Object}      configuration    The configuration value(s) to update. e.g., {'key1': value1, 'key2': value2}
     * @param  {Function}    [callback]       Standard callback function
     */
    var updateConfig = exports.updateConfig = function(appId, configuration, callback) {

    };

});
