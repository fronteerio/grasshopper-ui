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
define(['gh.api.admin', 'gh.api.app', 'gh.api.authentication', 'gh.api.config', 'gh.api.event', 'gh.api.orgunit', 'gh.api.series', 'gh.api.user'],
    function(adminAPI, appAPI, authenticationAPI, configAPI, eventAPI, orgunitAPI, seriesAPI, userAPI) {

        var gh = {
            'api': {
                'adminAPI': adminAPI,
                'appAPI': appAPI,
                'authenticationAPI': authenticationAPI,
                'configAPI': configAPI,
                'eventAPI': eventAPI,
                'orgunitAPI': orgunitAPI,
                'seriesAPI': seriesAPI,
                'userAPI': userAPI
            }
        };

        var initGH = function(callback) {
            callback(gh);
        };

        return {
            /*!
             * Invoked when the module has been loaded, which can trigger initialization in a chained manner.
             */
            'load': function(name, parentRequire, load, config) {
                initGH(load);
            }
        };
    }
);
