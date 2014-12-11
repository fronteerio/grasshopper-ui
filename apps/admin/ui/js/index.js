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

    var renderAdminData = function(tenants) {
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

    var getAdminData = function() {
        gh.api.tenantAPI.getTenants(function(err, tenants) {

            var todo = tenants.length;
            var done = 0;

            var getApps = function(tenantId, callback) {
                gh.api.appAPI.getApps(tenantId, function(err, apps) {
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
                console.log(tenants);
                renderAdminData(tenants);
            });
        });
    };

    var submitAppForm = function(ev) {
        var $submitButton = $(this);
        var $form = $(this).closest('form');
        var createApp = $submitButton.hasClass('gh-create-app');

        var tenantId = parseInt($submitButton.data('tenantid'), 10);
        var appId = parseInt($submitButton.data('appid'), 10);
        var displayName = $('#gh-app-displayname-' + appId).val();
        var enabled = $('#gh-app-enabled-' + appId).is(':checked');
        var host = $('#gh-app-host-' + appId).val();

        if (createApp) {
            displayName = $('.gh-app-displayname-new').val();
            enabled = $('.gh-app-enabled-new').is(':checked');
            host = $('.gh-app-host-new').val();
            gh.api.appAPI.createApp(displayName, host, tenantId, 'timetable', function(err, data) {
                if (err) {
                    return gh.api.utilAPI.notification('App not created.', 'The app could not be  successfully created.', 'error');
                }
                gh.api.utilAPI.notification('App created.', 'The app was successfully created.', 'success');
            });
        } else {
            gh.api.appAPI.updateApp(appId, displayName, enabled, host, function(err, data) {
                if (err) {
                    return gh.api.utilAPI.notification('App not updated.', 'The app could not be  successfully updated.', 'error');
                }
                gh.api.utilAPI.notification('App updated.', 'The app was successfully updated.', 'success');
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
        $('body').on('click', '#gh-create-app-form button', submitAppForm);
    };

    /**
     * Initialise the page
     */
    var initIndex = function() {
        addBinding();
        renderHeader();
        getAdminData();
    };

    initIndex();
});
