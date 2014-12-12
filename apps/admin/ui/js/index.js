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

define(['gh.core', 'bootstrap.calendar', 'bootstrap.listview', 'chosen', 'jquery-bbq'], function(gh) {


    /////////////////
    //  RENDERING  //
    /////////////////

    /**
     * Render the header
     */
    var renderHeader = function() {
        gh.api.utilAPI.renderTemplate($('#gh-header-template'), {
            'gh': gh
        }, $('#gh-header'));
    };

    /**
     * Render tenant admin functionality
     *
     * @param  {Object[]}    tenants    The tenants and apps to render
     */
    var renderTenants = function(tenants) {
        gh.api.utilAPI.renderTemplate($('#gh-tenants-template'), {
            'gh': gh,
            'tenants': tenants
        }, $('#gh-main'));
    };


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Log in using the local authentication strategy
     *
     * @return {Boolean}     Return false to avoid default form behaviour
     * @private
     */
    var doLogin = function() {
        var formValues = _.object(_.map($(this).serializeArray(), _.values));
        gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
            if (!err) {
                window.location = '/';
            } else {
                // Show an error to the user
            }
        });

        return false;
    };

    /**
     * Get tenant data and app data for those tenants and render them
     */
    var getTenantData = function() {
        gh.api.tenantAPI.getTenants(function(err, tenants) {

            var todo = tenants.length;
            var done = 0;

            var getApps = function(tenantId, callback) {
                gh.api.appAPI.getApps(tenantId, function(err, apps) {
                    // Sort the apps by host
                    apps.sort(gh.api.utilAPI.sortByHost);
                    // Cache the apps on the tenants object
                    tenants[done].apps = apps;

                    done++;
                    if (done === todo) {
                        callback(tenants);
                    } else {
                        getApps(tenants[done].id, callback);
                    }
                });
            };

            getApps(tenants[done].id, function(tenants) {
                tenants.sort(gh.api.utilAPI.sortByDisplayName);
                renderTenants(tenants);
            });
        });
    };

    /**
     * Submit the tenant form to create tenants, create apps or update apps
     */
    var submitTenantForm = function() {
        var $submitButton = $(this);
        var $form = $(this).closest('form');

        var createApp = $submitButton.hasClass('gh-create-app');
        var updateApp = $submitButton.hasClass('gh-update-app');
        var createTenant = $submitButton.hasClass('gh-create-tenant');

        var tenantId = parseInt($submitButton.data('tenantid'), 10);

        if (createApp) {
            var newAppDisplayName = $('.gh-app-displayname-new-' + tenantId).val();
            var newAppHost = $('.gh-app-host-new-' + tenantId).val();
            // Create a new app
            gh.api.appAPI.createApp(newAppDisplayName, newAppHost, tenantId, 'timetable', function(err, data) {
                if (err) {
                    return gh.api.utilAPI.notification('App not created.', 'The app could not be successfully created.', 'error');
                }
                getTenantData();
                gh.api.utilAPI.notification('App created.', 'The app was successfully created.', 'success');
            });
        } else if (updateApp) {
            var appId = parseInt($submitButton.data('appid'), 10);
            var updatedAppDisplayName = $('#gh-app-displayname-' + appId).val();
            var updatedAppEnabled = $('#gh-app-enabled-' + appId).is(':checked');
            var updatedAppHost = $('#gh-app-host-' + appId).val();
            // Update the app
            gh.api.appAPI.updateApp(appId, updatedAppDisplayName, updatedAppEnabled, updatedAppHost, function(err, data) {
                if (err) {
                    return gh.api.utilAPI.notification('App not updated.', 'The app could not be successfully updated.', 'error');
                }
                getTenantData();
                gh.api.utilAPI.notification('App updated.', 'The app was successfully updated.', 'success');
            });
        } else if (createTenant) {
            var newTenantDisplayName = $('#gh-app-tenant-new').val();
            gh.api.tenantAPI.createTenant(newTenantDisplayName, function(err, data) {
                if (err) {
                    return gh.api.utilAPI.notification('Tenant not created.', 'The tenant could not be successfully created.', 'error');
                }
                getTenantData();
                gh.api.utilAPI.notification('Tenant updated.', 'The tenant was successfully updated.', 'success');
            });
        }
    };


    //////////////////////
    //  INITIALISATION  //
    //////////////////////

    /**
     * Add bindings to various elements on the page
     */
    var addBinding = function() {
        $('body').on('submit', '#gh-signin-form', doLogin);
        $('body').on('click', '#gh-create-app-form button', submitTenantForm);
    };

    /**
     * Initialise the page
     */
    var initIndex = function() {
        addBinding();
        renderHeader();
        if (gh.data && gh.data.me) {
            getTenantData();
        }
    };

    initIndex();
});
