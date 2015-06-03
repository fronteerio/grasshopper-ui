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

define(['exports', 'gh.utils', 'gh.api.app', 'gh.api.authentication', 'gh.api.orgunit', 'gh.api.series', 'gh.api.tenant', 'gh.api.user'], function(exports, utils, appAPI, authenticationAPI, orgunitAPI, seriesAPI, tenantAPI, userAPI) {

    // Cache the test tenants and apps
    var _apps = null;
    var _orgunits = null;
    var _tenants = null;

    // Application types
    var _types = {
        'TIMETABLE': 'timetable'
    };


    ////////////////////////
    //  PUBLIC FUNCTIONS  //
    ////////////////////////

    /**
     * Initialise the QUnit async tests
     */
    var init = exports.init = function() {
        QUnit.moduleDone(onModuleDone);
        QUnit.moduleStart(onModuleStart);
        QUnit.testStart(onTestStart);
        QUnit.start();
    };

    /**
     * Return the test apps
     *
     * @return {Object[]}    The test apps
     */
    var getApps = exports.getApps = function() {
        return _apps;
    };

    /**
     * Return the primary test application
     *
     * @return {Object}    Object representing an application
     */
    var getTestApp = exports.getTestApp = function() {
        return _.find(_apps, function(app) {
            return app.id === 1;
        });
    };

    /**
     * Return a random organisational unit
     *
     * @param  {String}    [type]    Optional organisation unit type to return. One of 'course', 'subject', 'part' or 'module'
     * @return {Object}              Object representing an organisational unit
     */
    var getRandomOrgUnit = exports.getRandomOrgUnit = function(type) {
        // If a specific type of orgunit was requested we first filter down to a subset
        var filteredSet = _orgunits;
        if (type) {
            filteredSet = _.filter(_orgunits, function(orgunit) {
                return orgunit.type === type;
            });
        }

        // Return a sample of the orgunits
        return _.sample(filteredSet);
    };

    /**
     * Return a random series of a random organisational unit
     *
     * @return {Object}    Object representing an event series in an organisational unit
     */
    var getRandomSeries = exports.getRandomSeries = function() {
        var testOrgUnit = getRandomOrgUnit();
        return _.sample(testOrgUnit.Series);
    };

    /**
     * Get a random event from a random series
     *
     * @param  {Function}    callback            Standard callback function
     * @param  {Error}       callback.err        Error object containing the error code and error message
     * @param  {Event}       callback.response   Object representing an event in an event serie
     */
    var getRandomEvent = exports.getRandomEvent = function(callback) {
        var randomSeries = getRandomSeries();
        seriesAPI.getSeriesEvents(randomSeries.id, 1, 0, false, function(err, data) {
            callback(err, _.sample(data.results));
        });
    };

    /**
     * Return a random tenant
     *
     * @return {Object}    Object representing a tenant
     */
    var getRandomTenant = exports.getRandomTenant = function() {
        var tenant = _.chain(_.cloneDeep(_tenants)).sample().value();

        // Add the tenant's applications
        return _.extend(tenant, {'apps': _.filter(_apps, {'TenantId': tenant.id})});
    };

    /**
     * Returns the test application types
     */
    var getTypes = exports.getTypes = function() {
        return _types;
    };


    //////////////////////////
    //  INTERNAL FUNCTIONS  //
    //////////////////////////

    /**
     * Fetches all the tenants
     *
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var fetchTenants = function(callback) {
        // Fetch all the tenants
        tenantAPI.getTenants(function(err, tenants) {
            /* istanbul ignore if */
            if (err) {
                QUnit.stop();
            }

            // Cache the tenants
            _tenants = tenants;

            return callback();
        });
    };

    /**
     * Fetch all the applications for the tenants
     *
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var fetchAppsForTenants = function(callback) {
        // Collect the tenantIds
        var tenantIds = _.map(_tenants, function(tenant) { return tenant.id; });

        /**
         * Fetches the apps for each tenant
         *
         * @private
         */
        var _fetchAppsForTenant = function() {

            // Get the first tenant
            var tenantId = tenantIds.shift();

            // Fetch the apps for the tenant
            appAPI.getApps(tenantId, function(err, apps) {
                /* istanbul ignore if */
                if (err) {
                    return QUnit.stop();
                }

                // Cache the apps
                _apps = _.union(_apps, apps);

                // Stop the loop if all the apps for all the tenants have been retrieved and cached
                if (!tenantIds.length) {
                    return callback();
                }

                // Continue the loop
                return _fetchAppsForTenant();
            });
        };

        // Start fetching the apps
        _fetchAppsForTenant();
    };

    /**
     * Fetch all organisational units for tenants
     *
     * @param  {Function}    callback    Standard callback function
     */
    var fetchOrgUnitsForTenants = function(callback) {
        // Collect the appIds
        var appIds = _.map(_apps, function(app) { return app.id; });

        /**
         * Fetches the organisational units for each app
         *
         * @private
         */
        var _fetchOrgUnitsForApp = function() {

            // Get the first app
            var appId = appIds.shift();

            // Fetch the orgunits for the app
            orgunitAPI.getOrgUnits(appId, true, null, null, null, function(err, orgunits) {
                /* istanbul ignore if */
                if (err) {
                    return QUnit.stop();
                }

                // Only cache the orgunits if they have series
                orgunits = _.filter(orgunits.results, function(orgunit) {
                    return orgunit.Series.length;
                });

                _orgunits = _.union(_orgunits, orgunits);

                // Stop the loop if all the orgunits for all the apps have been retrieved and cached
                if (!appIds.length) {
                    return callback();
                }

                // Continue the loop
                return _fetchOrgUnitsForApp();
            });
        };

        // Start fetching the orgunits
        _fetchOrgUnitsForApp();
    };

    /**
     * Create a test user
     *
     * @param  {Number}      appId                The ID of the app to create the user in
     * @param  {Boolean}     isAdmin              Whether or not the user is an administrator
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The created user
     */
    var createTestUser = exports.createTestUser = function(appId, isAdmin, callback) {
        userAPI.createUser(appId, utils.generateRandomString() + ' user', utils.generateRandomString(true) + '@test.com', 'testtest', 'immediate', isAdmin, null, null, callback);
    };

    /**
     * Fire an event that indicates the end of the module tests
     *
     * @param  {Object}    details    Object containing test information
     * @private
     */
    var onModuleDone = function(details) {
        fireEvent('done.module.qunit.gh', details);
    };

    /**
     * Fire an event that indicates the start of the module tests
     *
     * @param  {Object}    details    Object containing test information
     * @private
     */
    var onModuleStart = function(details) {
        fireEvent('start.module.qunit.gh', details);
    };

    /**
     * Function that fetches the test data after each test
     *
     * @param  {Object}    details    Object containing test information
     * @private
     */
    var onTestStart = function(details) {
        QUnit.stop();

        // Enable cache for GET requests as Sinon relies on a known URL in order to be able
        // to intercept the call
        $.ajaxSetup({
            'cache': true
        });

        // Reset the test data
        _apps = null;
        _tenants = null;

        // Login with the global administrator
        authenticationAPI.login('administrator', 'administrator', function(err, data) {
            /* istanbul ignore if */
            if (err) {
                QUnit.stop();
            }

            // Fetch all the tenants
            fetchTenants(function() {

                // Fetch all the apps
                fetchAppsForTenants(function() {

                    // Fetch all the organisational units and series
                    fetchOrgUnitsForTenants(function() {
                        QUnit.start();
                    });
                });
            });
        });
    };

    /**
     * Dispatch an event to the window object
     *
     * @param  {String}    event    The event name
     * @paran  {Object}    data     Object containing the event data
     * @private
     */
    var fireEvent = function(event, data) {
        window.parent.$(window.parent.document).trigger(event, data);
    };
});
