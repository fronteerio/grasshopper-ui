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

    // Cache the tripos data
    var _triposData = {};


    //////////////
    //  SERIES  //
    //////////////

    /**
     * Decorate a borrowed serie with its parent info
     *
     * @param  {Object[]}    series    A collection of series
     */
    var decorateBorrowedSeriesWithParentInfo = exports.decorateBorrowedSeriesWithParentInfo = function(series) {
        _.each(series, function(serie) {

            // Only decorate borrowed series
            if (serie.borrowedFrom) {
                _.each(_triposData, function(orgUnitType) {

                    // Add the parent info to the organisational unit, if any
                    var parent = _.find(orgUnitType, function(orgUnit) { return orgUnit.id === serie.borrowedFrom.ParentId});
                    if (parent) {
                        serie.borrowedFrom.Parent = parent;
                    }
                });
            }
        });
    };


    ////////////////
    //  TRIPOSES  //
    ////////////////

    /**
     * Decorate an organisational unit with its parent info
     *
     * @param  {Object}    orgUnit    The organisational unit that needs to be decorated with his parent info
     * @private
     */
    var addParentInfoToOrgUnit = function(orgUnit) {
        if (orgUnit.ParentId) {
            _.each(_triposData, function(_orgUnitType) {

                // Add the parent info to the organisational unit, if any
                var parent = _.find(_orgUnitType, function(_el) { return _el.id === orgUnit.ParentId});
                if (parent) {
                    orgUnit.Parent = parent;
                }
            });
        }
    };

    /**
     * Return the complete tripos tree
     *
     * @return {Object}    Object containing the tripos data
     */
    var getTriposData = exports.getTriposData = function() {
        return _triposData;
    };

    /**
     * Return the tripos structure
     *
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The tripos structure
     */
    /* istanbul ignore next */
    var getTriposStructure = exports.getTriposStructure = function(callback) {
        if (!_.isFunction(callback)) {
            throw new Error('An invalid value for callback was provided');
        }

        var core = require('gh.core');
        var appId = core.data.me && core.data.me.AppId ? core.data.me.AppId : null;
        require('gh.api.orgunit').getOrgUnits(null, false, true, null, ['course', 'subject', 'part'], function(err, data) {
            if (err) {
                return callback(err);
            }

            var orgUnitTypes = {
                'modules': []
            };

            orgUnitTypes.courses = _.filter(data.results, function(course) {
                return course.type === 'course';
            });

            orgUnitTypes.subjects = _.filter(data.results, function(subject) {
                return subject.type === 'subject';
            });

            orgUnitTypes.parts = _.filter(data.results, function(part) {
                return part.type === 'part';
            });

            // Sort the data before displaying it
            orgUnitTypes.courses.sort(sortByDisplayName);
            orgUnitTypes.subjects.sort(sortByDisplayName);
            orgUnitTypes.parts.sort(sortByDisplayName);

            // Cache the organisational units
            _triposData = orgUnitTypes;

            // Add the parent objects to each organistional unit
            _.each(orgUnitTypes, function(orgUnitType) {
                _.each(orgUnitType, function(orgUnit) {
                    addParentInfoToOrgUnit(orgUnit);
                });
            });

            return callback(null, getTriposData());
        });
    };


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Sort given objects based on the displayName property.
     * The list will be ordered from A to Z.
     *
     * @see Array#sort
     */
    var sortByDisplayName = exports.sortByDisplayName = function(a, b) {
        if (a.displayName.toLowerCase() < b.displayName.toLowerCase()){
            return -1;
        } else if (a.displayName.toLowerCase() > b.displayName.toLowerCase()) {
            return 1;
        }
        return 0;
    };

    /**
     * Sort given objects based on the host property.
     * The list will be ordered from A to Z.
     *
     * @see Array#sort
     */
    var sortByHost = exports.sortByHost = function(a, b) {
        if (a.host.toLowerCase() < b.host.toLowerCase()){
            return -1;
        } else if (a.host.toLowerCase() > b.host.toLowerCase()) {
            return 1;
        }
        return 0;
    };
});
