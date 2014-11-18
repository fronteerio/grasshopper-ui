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
     * Create a new app
     *
     * @param  {String}      displayName    The name of the app
     * @param  {String}      host           The host on which the app can be found
     * @param  {Number}      tenantId       The ID of the tenant on wich to create the app
     * @param  {Function}    callback       Standard callback function
     */
    var createApp = exports.createApp = function(displayName, host, tenantId, callback) {

    };

    /**
     * Get an app
     *
     * @param  {Number}      appId       The ID of the app to retrieve
     * @param  {Function}    callback    Standard callback function
     */
    var getApp = exports.getApp = function(appId, callback) {

    };

    /**
     * Get all apps in a tenant
     *
     * @param  {Number}      tenantId     The ID of the tenant to retrieve the apps for
     * @param  {Function}    callback     Standard callback function
     */
    var getApps = exports.getApps = function(tenantId, callback) {
        if (!tenantId) {
            return callback({'code': 400, 'msg': 'A valid tenantId id should be provided'});
        }

        $.ajax({
            'url': '/api/apps/?tenantId=' + tenantId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the administrators for an app
     *
     * @param  {Number}      appId       The ID of the app to retrieve the administrators for
     * @param  {Number}      limit       The maximum number of results to retrieve
     * @param  {Number}      offset      The paging number of the results to retrieve
     * @param  {Function}    callback    Standard callback function
     */
    var getAppAdmins = exports.getAppAdmins = function(appId, limit, offset, callback) {

    };

    /**
     * Update an app
     *
     * @param  {Number}      appId          The ID of the app to update
     * @param  {String}      displayName    The updated app name
     * @param  {Boolean}     enabled        Whether the app should be enabled or not
     * @param  {String}      host           The updated app host
     * @param  {Function}    [callback]     Standard callback function
     */
    var updateApp = exports.updateApp = function(appId, displayName, enabled, host, callback) {

    };

    /**
     * Update the administrators of an app
     *
     * @param  {Number}      appId             The ID of the app for which to update the administrators
     * @param  {Object}      administrators    Object that describes the app administrator changes to apply. e.g., {'johndoe': true}
     * @param  {Function}    [callback]        Standard callback function
     */
    var updateAppAdmins = exports.updateAppAdmins = function(appId, administrators, callback) {

    };
});
