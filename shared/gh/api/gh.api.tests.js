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

define(['exports', 'gh.api.app', 'gh.api.authentication', 'gh.api.tenant'], function(exports, appAPI, authenticationAPI, tenantAPI) {

    // Cache the test tenants and apps
    var _apps = null;
    var _tenants = null;

    ////////////////////////
    //  PUBLIC FUNCTIONS  //
    ////////////////////////

    /**
     * Returns an app by its id
     *
     * @param  {Number}    appId    The application id
     * @return {Object}             Object representing an application
     */
    var getAppById = exports.getAppById = function(appId) {
        return _.find(_apps, {'id': appId});
    };

    /**
     * Returns the test apps
     *
     * @return {Object[]}    The test apps
     */
    var getApps = exports.getApps = function() {
        return _apps;
    };

    /**
     * Returns a tenant and its applications by its id
     *
     * @param  {Number}    tenantId    The tenant id
     * @return {Object}                Object representing a tenant
     */
    var getTenantById = exports.getTenantById = function(tenantId) {
        var tenants = _.cloneDeep(_tenants);
        return _.find(tenants, function(tenant) {

            // Add the tenant's applications
            if (tenant.id === tenantId) {
                return _.extend(tenant, {'apps': _.filter(_apps, {'TenantId': tenant.id})});
            }
        });
    };

    /**
     * Returns the test tenants
     *
     * @return {Object[]}    The test tenants
     */
    var getTenants = exports.getTenants = function() {
        var tenants = _.cloneDeep(_tenants);
        return _.map(tenants, function(tenant) {

            // Add the tenants' applications
            return _.extend(tenant, {'apps': _.filter(_apps, {'TenantId': tenant.id})});
        });
    };

    /**
     * Returns a random application
     *
     * @return {Object}    Object representing an application
     */
    var getRandomApp = exports.getRandomApp = function() {
        return _.sample(_apps);
    };

    /**
     * Returns a random tenant
     *
     * @return {Object}    Object representing a tenant
     */
    var getRandomTenant = exports.getRandomTenant = function() {
        var tenant = _.chain(_.cloneDeep(_tenants)).sample().value();

        // Add the tenant's applications
        return _.extend(tenant, {'apps': _.filter(_apps, {'TenantId': tenant.id})});
    };

    //////////////////////////
    //  INTERNAL FUNCTIONS  //
    //////////////////////////

    /**
     * Initialize the QUnit async tests
     */
    var init = function() {
        QUnit.moduleStart(onModuleStart);
    };

    /**
     * Function that is executed before the QUnit module test is started
     *
     * @param  {Object}    details
     * @api private
     */
    var onModuleStart = function(details) {
        QUnit.stop();

        // Login with the global administrator
        authenticationAPI.login('administrator', 'administrator', function(err, data) {
            if (err) {
                QUnit.stop();
            }

            // Fetch all the tenants
            fetchTenants(function() {

                // Fetch all the apps
                fetchAppsForTenants(function() {
                    QUnit.start();
                });
            });
        });
    };

    /**
     * Fetches all the tenants
     *
     * @param  {Function}    callback    Standard callback function
     */
    var fetchTenants = exports.fetchTenants = function(callback) {

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        // Fetch all the tenants
        tenantAPI.getTenants(function(err, tenants) {
            if (err) {
                QUnit.stop();
            }
            _tenants = tenants;

            return callback();
        });
    };

    /**
     * Fetch all the applications for the tenants
     *
     * @param  {Function}    callback    Standard callback function
     */
    var fetchAppsForTenants = exports.fetchAppsForTenants = function(callback) {

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        // Collect the tenantIds
        var tenantIds = _.map(_tenants, function(tenant) { return tenant.id; });

        /*!
         * Fetches the apps for each tenant
         */
        var _fetchAppsForTenant = function() {

            // Get the first tenant
            var tenantId = tenantIds.shift();

            // Fetch the apps for the tenant
            appAPI.getApps(tenantId, function(err, apps) {
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

    // Initialize the tests
    init();
});
