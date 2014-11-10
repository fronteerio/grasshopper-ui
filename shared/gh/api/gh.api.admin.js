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
     * Create a new global administrator
     *
     * @param  {String}      username        The username for the new administrator
     * @param  {String}      displayName     The display name for the new administrator
     * @param  {String}      password        The password for the new administrator
     * @param  {Function}    [callback]      Standard callback function
     */
    var createAdmin = exports.createAdmin = function(username, displayName, password, callback) {

    };

    /**
     * Get all global administrators
     *
     * @param  {Number}      [limit]     The maximum number of results to retrieve
     * @param  {Number}      [offset]    The paging number of the results to retrieve
     * @param  {Function}    callback    Standard callback function
     */
    var getAdmins = exports.getAdmins = function(limit, offset, callback) {

    };

    /**
     * Update a global administrator
     *
     * @param  {Number}      userId          The ID of the administrator to update
     * @param  {String}      displayName     The updated display name for the administrator
     * @param  {Function}    callback        Standard callback function
     */
    var updateAdmin = exports.updateAdmin = function(userId, displayName, callback) {

    };
});
