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

define(['gh.core', 'chosen'], function(gh) {

    // Get the current page, strip out slashes etc
    var currentPage = window.location.pathname.split('/')[1];


    /////////////////
    //  RENDERING  //
    /////////////////

    /**
     * Render admin user functionality and show the container
     *
     * @param  {Object[]}    administrators    The administrator users to render
     * @private
     */
    var renderAdmins = function(administrators) {
        gh.utils.renderTemplate($('#gh-administrators-template'), {
            'gh': gh,
            'administrators': administrators
        }, $('#gh-administrators-container'));
        $('#gh-administrators-container').show();
    };

    /**
     * Render configuration functionality and show the container
     *
     * @private
     */
    var renderConfig = function(tenants) {
        gh.utils.renderTemplate($('#gh-configuration-template'), {
            'gh': gh,
            'tenants': tenants
        }, $('#gh-configuration-container'));
        $('#gh-configuration-container').show();
    };

    /**
     * Render the header
     *
     * @private
     */
    var renderHeader = function() {
        gh.utils.renderTemplate($('#gh-header-template'), {
            'data': {
                'gh': gh,
                'isGlobalAdminUI': true
            }
        }, $('#gh-header'));
    };

    /**
     * Render the admin navigation
     *
     * @private
     */
    var renderNavigation = function() {
        gh.utils.renderTemplate($('#gh-navigation-template'), {
            'gh': gh,
            'currentPage': currentPage
        }, $('#gh-navigation-container'));
    };

    /**
     * Render tenant admin functionality and show the container
     *
     * @param  {Object[]}    tenants    The tenants and apps to render
     * @private
     */
    var renderTenants = function(tenants) {
        gh.utils.renderTemplate($('#gh-tenants-template'), {
            'gh': gh,
            'tenants': tenants
        }, $('#gh-tenants-container'));
        $('#gh-tenants-container').show();
    };


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Log in using the local authentication strategy
     *
     * @param  {Event}    ev    The jQuery event
     * @private
     */
    var doLogin = function(ev) {
        // Prevent the form from being submitted
        ev.preventDefault();

        // Collect and submit the form data
        var formValues = _.object(_.map($(this).serializeArray(), _.values));
        gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
            if (!err) {
                var state = $.param(History.getState().data);
                if (state) {
                    return window.location.reload();
                }
                window.location = '/';
            } else {
                gh.utils.notification('Login failed', 'Logging in to the application failed', 'error');
            }
        });
    };

    /**
     * Get the configuration data for all apps in all tenants
     *
     * @param  {Object[]}    tenants    The tenants and apps to fetch configuration for
     * @private
     */
    var getConfigData = function(tenants, callback) {
        var tenantsDone = 0;

        var appsToDo = 0;
        var appsDone = 0;

        /**
         * Recursive function that retrieves configuration for the provided apps and caches it
         * on the app object
         *
         * @param  {Object[]}    apps         Array op applications to retrieve the configuration for
         * @param  {Function}    _callback    Standard callback function
         * @private
         */
        var getConfigForApps = function(apps, _callback) {
            gh.api.configAPI.getConfig(apps[appsDone].id, function(err, config) {
                if (err) {
                    return gh.utils.notification('Configuration not retrieved.', 'The configuration could not be successfully retrieved.', 'error');
                }

                // Remove unwanted properties from the configuration object
                delete config.createdAt;
                delete config.updatedAt;

                // Cache the configuration on the app object
                apps[appsDone].config = config;

                // If there are other apps in the tenant, fetch the next one's config
                appsDone++;
                if (appsDone !== appsToDo) {
                    return getConfigForApps(apps, _callback);
                }

                // There are no other apps. If there are no other tenants call back
                tenantsDone++;
                if (tenantsDone === tenants.length) {
                    return _callback();
                }

                // There are no other apps. There are other tenants so go and get the app configs for those
                getAppsInTenant(tenants[tenantsDone], _callback);
            });
        };

        /**
         * Recursive function that goes through a tenant's apps and retrieves the config for them
         *
         * @param  {Object}      tenant       The tenant to iterate over its apps
         * @param  {Function}    _callback    Standard callback function
         * @private
         */
        var getAppsInTenant = function(tenant, _callback) {
            // If there are no apps we can skip this tenant
            if (tenant.apps.length === 0) {
                // If no other tenants are left, execute the callback
                tenantsDone++;
                if (tenantsDone === tenants.length) {
                    return _callback();
                }

                // There are other tenants, iterate over the next one's apps
                return getAppsInTenant(tenants[tenantsDone], _callback);
            }

            // There are apps, got retrieve their configuration
            appsToDo = tenant.apps.length;
            appsDone = 0;
            getConfigForApps(tenant.apps, _callback);
        };

        // If there are no tenants yet we can start rendering
        if (tenants.length === 0) {
            return callback([]);
        }

        // There are tenants. Go retrieve their apps
        getAppsInTenant(tenants[tenantsDone], function() {
            callback(tenants);
        });
    };

    /**
     * Get tenant data and app data for those tenants and render them
     *
     * @private
     */
    var getTenantData = function(callback) {
        gh.api.tenantAPI.getTenants(function(err, tenants) {
            if (err) {
                gh.utils.notification('Fetching tenants failed.', 'An error occurred while fetching the tenants.', 'error');
            }

            var todo = tenants.length;
            var done = 0;

            var getApps = function(tenantId, _callback) {
                gh.api.appAPI.getApps(tenantId, function(err, apps) {
                    if (err) {
                        gh.utils.notification('Fetching apps failed.', 'An error occurred while fetching the apps.', 'error');
                    }

                    // Sort the apps by host
                    apps.sort(gh.utils.sortByHost);
                    // Cache the apps on the tenants object
                    tenants[done].apps = apps;

                    done++;
                    if (done === todo) {
                        _callback(tenants);
                    } else {
                        getApps(tenants[done].id, _callback);
                    }
                });
            };

            // If there are no tenants yet we can start rendering
            if (todo === 0) {
                callback([]);
            // Otherwise we get the apps for each tenant
            } else {
                getApps(tenants[done].id, function(tenants) {
                    tenants.sort(gh.utils.sortByDisplayName);
                    callback(tenants);
                });
            }
        });
    };

    /**
     * Get administrator users and render them
     *
     * @private
     */
    var getAdminUserData = function(callback) {
        gh.api.adminAPI.getAdmins(null, null, function(err, administrators) {
            if (err) {
                gh.utils.notification('Fetching admins failed.', 'An error occurred while fetching the admins.', 'error');
            }

            callback(administrators.rows);
        });
    };

    /**
     * Submit the tenant form to create tenants, create apps or update apps
     *
     * @private
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
                    return gh.utils.notification('App not created.', 'The app could not be successfully created.', 'error');
                }
                setUpTenants();
                gh.utils.notification('App created.', 'The app was successfully created.', 'success');
            });
        } else if (updateApp) {
            var appId = parseInt($submitButton.data('appid'), 10);
            var updatedAppDisplayName = $('#gh-app-displayname-' + appId).val();
            var updatedAppEnabled = $('#gh-app-enabled-' + appId).is(':checked');
            var updatedAppHost = $('#gh-app-host-' + appId).val();
            // Update the app
            gh.api.appAPI.updateApp(appId, updatedAppDisplayName, updatedAppEnabled, updatedAppHost, function(err, data) {
                if (err) {
                    return gh.utils.notification('App not updated.', 'The app could not be successfully updated.', 'error');
                }
                setUpTenants();
                gh.utils.notification('App updated.', 'The app was successfully updated.', 'success');
            });
        } else if (createTenant) {
            var newTenantDisplayName = $('#gh-app-tenant-new').val();
            gh.api.tenantAPI.createTenant(newTenantDisplayName, function(err, data) {
                if (err) {
                    return gh.utils.notification('Tenant not created.', 'The tenant could not be successfully created.', 'error');
                }
                setUpTenants();
                gh.utils.notification('Tenant updated.', 'The tenant was successfully updated.', 'success');
            });
        }
    };

    /**
     * Submit the administrator form to create or update administrator users
     *
     * @private
     */
    var submitAdministratorForm = function() {
        var $submitButton = $(this);
        var $form = $(this).closest('form');

        var createAdmin = $submitButton.hasClass('gh-create-admin');
        var updateAdmin = $submitButton.hasClass('gh-update-admin');

        if (createAdmin) {
            var newAdminDisplayName = $('#gh-admin-displayname-new').val();
            var newAdminUserName = $('#gh-admin-username-new').val();
            var newAdminPassword = $('#gh-admin-password-new').val();

            gh.api.adminAPI.createAdmin(newAdminUserName, newAdminDisplayName, newAdminPassword, function(err, administrator) {
                if (err) {
                    return gh.utils.notification('Administrator not created.', 'The administrator could not be successfully created.', 'error');
                }
                setUpUsers();
                gh.utils.notification('Administrator created.', 'The administrator was successfully created.', 'success');
            });
        } else if (updateAdmin) {
            var adminId = parseInt($submitButton.data('adminid'), 10);
            var updateAdminDisplayName = $('#gh-admin-displayname-' + adminId).val();

            gh.api.adminAPI.updateAdmin(adminId, updateAdminDisplayName, function(err, administrator) {
                if (err) {
                    return gh.utils.notification('Administrator not updated.', 'The administrator could not be successfully updated.', 'error');
                }
                setUpUsers();
                gh.utils.notification('Administrator updated.', 'The administrator was successfully updated.', 'success');
            });
        }
    };

    /**
     * Submit the configuration form and save the values
     *
     * @return {Boolean}    Avoid default form submit behaviour
     * @private
     */
    var submitConfigurationForm = function() {
        var $form = $(this);

        // Serialise the form values into an object that can be sent to the server
        var configValues = _.object(_.map($form.serializeArray(), _.values));

        // Standards say that unchecked checkboxes shouldn't be sent over to the server. Too bad, we need to add them
        // in explicitely as config values might have changed.
        _.each($('[type="checkbox"]:not(:checked)', $form), function(chk) {
            configValues[$(chk).attr('name')] = $(chk).is(':checked');
        });

        // Update the configuration
        gh.api.configAPI.updateConfig($form.data('appid'), configValues, function(err) {
            if (err) {
                return gh.utils.notification('Configuration not updated.', 'The configuration could not be successfully updated.', 'error');
            }
            return gh.utils.notification('Configuration updated.', 'The configuration was successfully updated.', 'success');
        });

        return false;
    };

    /**
     * Set up the configuration page
     *
     * @private
     */
    var setUpConfig = function() {
        getTenantData(function(tenants) {
            getConfigData(tenants, function(tenants) {
                renderConfig(tenants);
            });
        });
    };

    /**
     * Set up the tenants page
     *
     * @private
     */
    var setUpTenants = function() {
        getTenantData(function(tenants) {
            renderTenants(tenants);
        });
    };

    /**
     * Set up the users page
     *
     * @private
     */
    var setUpUsers = function() {
        getAdminUserData(function(administrators) {
            renderAdmins(administrators);
        });
    };

    /**
     * Update the value attribute of a checkbox
     *
     * @private
     */
    var updateCheckboxValue = function() {
        $(this).val($(this).is(':checked'));
    };

    /**
     * Launch the selected application
     *
     * @private
     */
    var launchApp = function() {
        var host = $(this).data('host');
        window.open('//' + host, '_blank');
    };


    //////////////////////
    //  INITIALISATION  //
    //////////////////////

    /**
     * Add bindings to various elements on the page
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('change', 'input[type="checkbox"]', updateCheckboxValue);
        $('body').on('click', '#gh-tenants-apps-form .gh-update-app', submitTenantForm);
        $('body').on('click', '#gh-tenants-apps-form .gh-create-app', submitTenantForm);
        $('body').on('click', '#gh-tenants-apps-form .gh-create-tenant', submitTenantForm);
        $('body').on('click', '#gh-tenants-apps-form .gh-launch-app', launchApp);
        $('body').on('click', '#gh-administrators-form button', submitAdministratorForm);
        $('body').on('submit', '.gh-configuration-form', submitConfigurationForm);
        $('body').on('submit', '#gh-signin-form', doLogin);
    };

    /**
     * Initialise the page
     *
     * @private
     */
    var initIndex = function() {
        addBinding();
        renderHeader();
        // Determine which page to load based on the login state and
        // page the user's on
        if (gh.data && !gh.data.me.anon) {
            // Show the right content, depending on the page the user's on
            if (currentPage === 'configuration') {
                setUpConfig();
            } else if (currentPage === 'tenants') {
                setUpTenants();
            } else if (currentPage === 'users') {
                setUpUsers();
            } else {
                currentPage = 'tenants';
                setUpTenants();
            }
            renderNavigation();
        }
    };

    initIndex();
});
