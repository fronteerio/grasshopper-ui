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

/*!
 * Load all of the 3rd party libraries that need to be present from the very beginning, as well as the actual
 * core client-side GH APIs
 */
define([
        /*!
         * The ! after `gh.api` indicates that this module is actually treated as a *plugin*, which is a special kind of
         * requirejs module. The difference we need is that the module can return a `load` function that can chain together
         * an initialization process client-size. We use this to initialize the client-side data.
         */
        'gh.api!',

        'jquery',
        'lodash',
        'bootstrap',

        /*!
         * All the Grasshopper API libraries found in /shared/gh/api. By including these here, requirejs will know that the
         * libraries are already included in the `gh.core` dependency and individual libraries will not be loaded
         * on the client when requested.
         */
        'gh.api.admin',
        'gh.api.app',
        'gh.api.authentication',
        'gh.api.config',
        'gh.api.event',
        'gh.api.groups',
        'gh.api.orgunit',
        'gh.api.series',
        'gh.api.tenant',
        'gh.api.tests',
        'gh.api.user',
        'gh.api.util',

        /**
         * Grasshopper plugins
         */
        'bootstrap.listview'
    ],

    function(gh) {
        console.log('return gh', gh);
        return gh;
    }
);
