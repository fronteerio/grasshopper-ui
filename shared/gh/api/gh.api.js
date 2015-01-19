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

/**
 * Initialises the grasshopper APIs
 */
define(['gh.api.admin', 'gh.api.app', 'gh.api.authentication', 'gh.api.config', 'gh.api.event', 'gh.api.groups',
        'gh.api.orgunit', 'gh.api.series', 'gh.api.tenant', 'gh.api.user', 'gh.api.util'],
    function(adminAPI, appAPI, authenticationAPI, configAPI, eventAPI, groupsAPI, orgunitAPI, seriesAPI, tenantAPI, userAPI, utilAPI) {

        var gh = {
            'api': {
                'adminAPI': adminAPI,
                'appAPI': appAPI,
                'authenticationAPI': authenticationAPI,
                'configAPI': configAPI,
                'eventAPI': eventAPI,
                'groupsAPI': groupsAPI,
                'orgunitAPI': orgunitAPI,
                'seriesAPI': seriesAPI,
                'tenantAPI': tenantAPI,
                'userAPI': userAPI,
                'utilAPI': utilAPI
            },
            'data': {
                'me': null
            }
        };

        var initGH = function(callback) {
            // Load the me feed
            userAPI.getMe(function(err, me) {
                /* istanbul ignore else */
                if (!err) {
                    gh.data.me = me;

                } else {
                    // Intercept 503 status indicating that the server is down
                    if (err.code === 503) {
                        gh.api.utilAPI.redirect().unavailable();
                    }
                }

                utilAPI.cachePartials(function() {
                    // Continue startup

                    // The APIs have now fully initialised. All javascript that
                    // depends on the initialised core APIs can now execute
                    return callback(gh);
                });
            });
        };

        return {
            'pluginBuilder': 'pluginBuilder',
            /*!
             * Invoked when the module has been loaded, which can trigger initialization in a chained manner.
             */
            'load': function(name, parentRequire, load, config) {
                initGH(load);
            }
        };
    }
);
