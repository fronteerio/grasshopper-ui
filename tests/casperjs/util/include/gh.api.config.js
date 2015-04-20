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

/**
 * Config API functions
 */
var configAPI = (function() {

    /**
     * Update configuration values for an app
     *
     * @param  {Number}      appId           The ID of the app you wish to update configuration for. Defaults to the current app
     * @param  {Object}      configValues    The configuration value(s) to update. e.g., {'key1': value1, 'key2': value2}
     * @param  {Function}    callback        Standard callback function
     * @param  {Object}      callback.err    Error object containing the error code and error message
     */
    var updateConfig = function(appId, configValues, callback) {
        var config = null;
        var err = null;

        mainUtil.callInternalAPI('config', 'updateConfig', [appId, configValues], function(_err, _config) {
            if (_err) {
                casper.echo('Could not persist the configuration. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                err = _err;
            } else {
                config = _config;
            }
        });

        casper.waitFor(function() {
            return config !== null || err !== null;
        }, function() {
            callback(err, config);
        });
    };

    return {
        'adminUI': 'http://admin.grasshopper.local',
        'tenantUI': 'http://2013.timetable.cam.ac.uk',
        'updateConfig': updateConfig,
        'waitTimeout': 30000
    };
})();
