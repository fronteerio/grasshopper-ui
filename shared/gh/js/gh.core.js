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
        'jquery-history',

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

        /**
         * Grasshopper plugins
         */
        'gh.listview'
    ],

    function(gh) {

        // The UI uses a `gh-preload` class on the body to avoid structural elements animating during page setup.
        // By the time the logic reaches this code the structural elements have been rendered and the class
        // can be removed, allowing for animations in the page.
        $('body').removeClass('gh-preload');

        // Disable cache for GET requests. Especially IE9 has problems without this
        $.ajaxSetup({
            'cache': false
        });

        // Globally catch ajax errors and track the error when it's an API call
        $(document).ajaxError(function(ev, jqXHR, ajaxSettings) {
            // Only track the error if it's an API call
            if (ajaxSettings.url.indexOf('/api') === 0) {
                gh.utils.trackEvent(['Generic', 'API call error'], {
                    'endpoint': ajaxSettings.url,
                    'http_code': jqXHR.status,
                    'message': jqXHR.responseText || jqXHR.statusText
                });
            }
        });

        // Extend jQuery with a `onAvailable` function that checks whether an element is available in the DOM
        // and executes a callback when it is
        $.fn.onAvailable = function(callback) {
            // Cache the selector we're waiting for
            var selector = this.selector;
            // Initiate a timer
            var timer = null;
            // If the element has become available execute the callback
            /* istanbul ignore next */
            if (this.length > 0) {
                callback.call(this);
                clearInterval(timer);
            }

            // If the element isn't available yet, set a timer that checks for it periodically
            // and executes the callback when it becomes available
            else {
                // Clear the interval after 20 seconds, no matter what the result
                /* istanbul ignore next */
                setTimeout(function() {
                    clearInterval(timer);
                }, 20000);

                // Set a timer that checks for the element
                timer = setInterval(function() {
                    // If the element is available, execute the callback and clear the interval
                    if ($(selector).length > 0) {
                        clearInterval(timer);
                        callback.call($(selector));
                    }
                }, 5);
            }
        };

        return gh;
    }
);
