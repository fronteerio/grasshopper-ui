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
     * Decorate a borrowed series with its parent info
     *
     * @param  {Object[]}    series    A collection of series
     */
    var decorateBorrowedSeriesWithParentInfo = exports.decorateBorrowedSeriesWithParentInfo = function(series) {
        _.each(series, function(serie) {

            // Only decorate borrowed series
            /* istanbul ignore else */
            if (serie.borrowedFrom) {
                _.each(_triposData, function(orgUnitType) {

                    // Add the parent info to the organisational unit, if any
                    var parent = _.find(orgUnitType, function(orgUnit) {
                        return orgUnit.id === serie.borrowedFrom.ParentId;
                    });

                    /* istanbul ignore next */
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
     * Return the tripos structure
     *
     * @return {Object}    The tripos structure
     */
    var triposData = exports.triposData = function() {
        return _triposData;
    };

    /**
     * Get a part by its id
     *
     * @param  {Number}     partId      The id of the part to retrieve
     * @return {Object}                 The organisational unit that represents the part
     */
    var getPartById = exports.getPartById = function(partId) {
        return _.find(_triposData.parts, {'id': partId});
    };

    /**
     * Decorate an organisational unit with its parent info
     *
     * @param  {Object}    orgUnit    The organisational unit that needs to be decorated with his parent info
     */
    var addParentInfoToOrgUnit = exports.addParentInfoToOrgUnit = function(orgUnit) {
        if (orgUnit.ParentId) {
            _.each(_triposData, function(_orgUnitType) {

                // Add the parent info to the organisational unit, if any
                var parent = _.find(_orgUnitType, function(_orgUnit) {
                    return _orgUnit.id === orgUnit.ParentId;
                });

                if (parent) {
                    orgUnit.Parent = parent;
                }
            });
        }
    };

    /**
     * Return the tripos structure
     *
     * @param  {Number}      [appId]               The application to retrieve the tripos structure for
     * @param  {Boolean}     includePermissions    Whether the permissions should be included or not
     * @param  {Function}    callback              Standard callback function
     * @param  {Object}      callback.err          Error object containing the error code and error message
     * @param  {Object}      callback.response     The tripos structure
     * @throws {Error}                             A parameter validation error
     *
     * * The returned tripos structure will be something in the lines of:
     * *
     * * {
     * *     'courses': [
     * *         {orgUnit}
     * *     ],
     * *     'subjects': [
     * *         {orgUnit}
     * *     ],
     * *     'parts': [
     * *         {
     * *             'id': {Number},
     * *             'displayName': {String},
     * *             'ParentId': {Number},
     * *             'Parent': {
     * *                 'id': {Number},
     * *                 'displayName': {String},
     * *                 'ParentId': {Number},
     * *                 'Parent': {
     * *                     'id': {Number},
     * *                     'displayName': {String},
     * *                     'ParentId': {null},
     * *                     ...
     * *                 },
     * *             },
     * *             ...
     * *         },
     * *         {
     * *             'id':          {Number},
     * *             'displayName': {String},
     * *             'ParentId':    {null}
     * *             ...
     * *         }
     * *     ]
     * * }
     */
    var getTriposStructure = exports.getTriposStructure = function(appId, includePermissions, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('An invalid value for callback was provided');
        } else if (!_.isBoolean(includePermissions)) {
            throw new Error('An invalid value for includePermissions was provided');
        } else if (appId && !_.isNumber(appId)) {
            throw new Error('An invalid value for appId was provided');
        }

        var core = require('gh.core');
        if (!appId) {
            appId = core.data.me && core.data.me.AppId ? core.data.me.AppId : null;
        }

        require('gh.api.orgunit').getOrgUnits(appId, false, includePermissions, null, ['course', 'subject', 'part'], function(err, data) {
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
            orgUnitTypes.parts.sort(sortByDisplayName);
            orgUnitTypes.subjects.sort(sortByDisplayName);

            // Cache the organisational units
            _triposData = orgUnitTypes;

            // Add the parent objects to each organisational unit
            _.each(orgUnitTypes, function(orgUnitType) {
                _.each(orgUnitType, function(orgUnit) {
                    addParentInfoToOrgUnit(orgUnit);
                });
            });

            return callback(null, _triposData);
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
