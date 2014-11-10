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
     * Change a user's local password
     *
     * @param  {Number}      userId           The ID of the user for which to change the local password
     * @param  {String}      newPassword      The new password for the user
     * @param  {String}      [oldPassword]    The previous password for the user. This is only required when the current user is not an administrator
     * @param  {Function}    callback         Standard callback function
     */
    var changePassword = exports.changePassword = function(userId, newPassword, oldPassword, callback) {

    };

    /**
     * Create a new user with a local authentication strategy
     *
     * @param  {Number}      appId              The ID of the app on which the user should be created
     * @param  {String}      displayName        The display name of the user
     * @param  {String}      email              The email address for the user. This will be used as the username for the user
     * @param  {String}      password           The password with which the user will authenticate
     * @param  {String}      emailPreference    The email preference for the user
     * @param  {Function}    callback           Standard callback function
     */
    var createUser = exports.createUser = function(appId, displayName, email, password, emailPreference, callback) {

    };

    /**
     * Crop the profile picture for a user
     *
     * @param  {Number}      userId      The ID of the user to crop the profile picture for
     * @param  {Number}      width       The width of the square that needs to be cropped out
     * @param  {Number}      x           The x coordinate of the top left corner to start cropping at
     * @param  {Number}      y           The y coordinate of the top left corner to start cropping at
     * @param  {Function}    callback    Standard callback function
     */
    var cropPicture = exports.cropPicture = function(userId, width, x, y, callback) {

    };

    /**
     * Get the calendar for a user
     *
     * @param  {Number}      userId      The ID of the user to get the calendar for
     * @param  {String}      from        The timestamp (ISO 8601) from which to get the calendar for the user
     * @param  {String}      to          The timestamp (ISO 8601) until which to get the calendar for the user
     * @param  {Function}    callback    Standard callback function
     */
    var getCalendar = exports.getCalendar = function(userId, from, to, callback) {

    };

    /**
     * Get the calendar for a user in iCal
     *
     * @param  {Number}      userId       The ID of the user to get the calendar for
     * @param  {String}      signature    The access control signature
     * @param  {Function}    callback     Standard callback function
     */
    var getCalendarICal = exports.getCalendarICal = function(userId, signature, callback) {

    };

    /**
     * Get the calendar for a user in RSS
     *
     * @param  {Number}      userId       the ID of the user to get the calendar for
     * @param  {String}      signature    The access control signature
     * @param  {Function}    callback     Standard callback function
     */
    var getCalendarRSS = exports.getCalendarRSS = function(userId, signature, callback) {

    };

    /**
     * Get the current user
     *
     * @param  {Function}    callback    Standard callback function
     */
    var getMe = exports.getMe = function(callback) {

    };

    /**
     * Get the upcoming events for a user
     *
     * @param  {Number}      userId      The ID of the user to get the upcoming events for
     * @param  {Number}      [limit]     The maximum number of results to retrieve
     * @param  {Number}      [offset]    The paging number of the results to retrieve
     * @param  {Function}    callback    Standard callback function
     */
    var getUpcomingEvents = exports.getUpcomingEvents = function(userId, limit, offset, callback) {

    };

    /**
     * Get a user
     *
     * @param  {Number}      userId      The ID of the user to retrieve
     * @param  {Function}    callback    Standard callback function
     */
    var getUser = exports.getUser = function(userId, callback) {

    };

    /**
     * Get all users for an app
     *
     * @param  {Number}      appId         The ID of the app to retrieve the users for
     * @param  {Number}      [limit]       The maximum number of results to retrieve
     * @param  {Number}      [offset]      The paging number of the results to retrieve
     * @param  {Function}    [callback]    [description]
     */
    var getUsers = exports.getUsers = function(appId, limit, offset, callback) {

    };

    /**
     * Import users using a CSV file
     *
     * @param  {Number}      tenantId                  The ID of the tenant to which the users should be imported
     * @param  {File}        file                      The CSV file to import
     * @param  {String}      authenticationStrategy    The authentication strategy for the user
     * @param  {String[]}    [appIds]                  The ID(s) of the app(s) to which the users should be associated
     * @param  {Boolean}     [forceProfileUpdate]      Whether the user information should be updated, even when other user information is already present
     * @param  {Function}    [callback]                Standard callback function
     */
    var importUsers = exports.importUsers = function(tenantId, file, authenticationStrategy, appIds, forceProfileUpdate, callback) {

    };

    /**
     * Update the app administrator status for a user
     *
     * @param {Number}      userId      The ID of the user to update the app administrator status for
     * @param {Boolean}     isAdmin     Whether the user should be an app administrator or not
     * @param {Function}    callback    Standard callback function
     */
    var setAdmin = exports.setAdmin = function(userId, isAdmin, callback) {

    };

    /**
     * Store a profile picture for a user
     *
     * @param  {Number}      userId        The ID of the user to store the profile picture for
     * @param  {File}        file          The image that should be stored as the user profile picture
     * @param  {Function}    [callback]    Standard callback function
     */
    var storePicture = exports.storePicture = function(userId, file, callback) {

    };

    /**
     * Update a user
     *
     * @param  {Number}      userId               The ID of the user to update
     * @param  {Number}      appId                The ID of the app for which to update the app-specific user values
     * @param  {String}      [displayName]        The updated user display name
     * @param  {String}      [email]              The updated user email address
     * @param  {String}      [emailPreference]    The updated user email preference
     * @param  {Function}    [callback]           Standard callback function
     */
    var updateUser = exports.updateUser = function(userId, appId, displayName, email, emailPreference, callback) {

    };
});
