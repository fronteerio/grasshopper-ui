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
     * Crop the picture for an event
     *
     * @param  {Number}      eventId     The ID of the event to crop the picture for
     * @param  {Number}      width       The width of the square that needs to be cropped out
     * @param  {Number}      x           The x coordinate of the top left corner to start cropping at
     * @param  {Number}      y           The y coordinate of the top left corner to start cropping at
     * @param  {Function}    callback    Standard callback function
     */
    var cropPicture = exports.cropPicture = function(eventId, width, x, y, callback) {

    };

    /**
     * Delete an event
     *
     * @param  {Number}      eventId       The ID of the event to delete
     * @param  {Function}    [callback]    Standard callback function
     */
    var deleteEvent = exports.deleteEvent = function(eventId, callback) {

    };

    /**
     * Get an event
     *
     * @param  {Number}      eventId     The ID of the event to retrieve
     * @param  {Function}    callback    Standard callback function
     */
    var getEvent = exports.getEvent = function(eventId, callback) {

    };

    /**
     * Subscribe to an event
     *
     * @param  {Number}      eventId       The ID of the event to subscribe to
     * @param  {Function}    [callback]    Standard callback function
     */
    var subscribe = exports.subscribe = function(eventId, callback) {

    };

    /**
     * Update an event
     *
     * @param  {Number}      eventId          The ID of the event to update
     * @param  {String}      [displayName]    The updated event display name
     * @param  {String}      [description]    The updated event description
     * @param  {Number}      [groupId]        The updated ID of the group that can manage the event
     * @param  {Number}      [start]          The updated timestamp (ISO 8601) at which the event starts
     * @param  {Number}      [end]            The updated timestamp (ISO 8601) at which the event ends
     * @param  {String}      [location]       The updated location of the event
     * @param  {String}      [notes]          The updated notes for the event
     * @param  {Function}    [callback]       Standard callback function
     */
    var updateEvent = exports.updateEvent = function(eventId, displayName, description, groupId, start, end, location, notes, callback) {

    };

    /**
     * Store a picture for an event
     *
     * @param  {Number}      eventId       The ID of the event to store the picture for
     * @param  {File}        file          The image that should be stored as the event picture
     * @param  {Function}    [callback]    Standard callback function
     */
    var storePicture = exports.storePicture = function(eventId, file, callback) {

    };

    /**
     * update the organisers of an event
     *
     * @param  {Number}      eventId       The ID of the event to update the organisers for
     * @param  {Number}      groupId       The ID of the group for which to update the members
     * @param  {Object}      organisers    Object that describes the event organiser changes to apply. e.g., {'organiserOther': {'{organiserUser}': false}}
     * @param  {Function}    [callback]    Standard callback function
     */
    var updateOrganisers = exports.updateOrganisers = function(eventId, groupId, organisers, callback) {

    };
});
