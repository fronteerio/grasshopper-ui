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

    // Cache the application configuration
    var configuration = {};

    /**
     * Return the application configuration
     *
     * @return {Object}    The application configuration
     */
    var getConfig = exports.getConfig = function() {
        return configuration;
    };

    /**
     * Get a specific configuration value
     *
     * @param  {String}                   key    The configuration key
     * @return {Boolean|Number|String}           The requested configuration value
     */
    var getConfigValue = exports.getConfigValue = function(key) {
        return configuration[key];
    };


    //////////////////
    //  INITIALISE  //
    //////////////////

    /**
     * Load the application configuration
     *
     * @param  {Function}    callback        Standard callback function
     * @param  {Error}       callback.err    Object containing the error code and error message
     */
    var init = exports.init = function(callback) {
        // Read the configuration file
        $.ajax({
            'dataType': 'json',
            'url': '/shared/gh/files/config.json',
            'success': function(data) {
                // Cache the configurations
                configuration = data;
                return callback();
            },
            'error': function() {
                return callback({'code': 500, 'msg': 'Error while requesting the application configuration'});
            }
        });
    };
});
