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

/**
 * Initialises the grasshopper APIs
 */
define(['gh.utils', 'gh.api.admin', 'gh.api.app', 'gh.api.authentication', 'gh.api.config', 'gh.api.event', 'gh.api.groups',
        'gh.api.orgunit', 'gh.api.series', 'gh.api.tenant', 'gh.api.user'],
    function(utils, adminAPI, appAPI, authenticationAPI, configAPI, eventAPI, groupsAPI, orgunitAPI, seriesAPI, tenantAPI, userAPI) {

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
                'userAPI': userAPI
            },
            'config': {},
            'utils': utils,
            'data': {
                'me': null
            }
        };

        /**
         * Initialise the various APIs and data needed to make the app function
         *
         * @param  {Function}    callback       Standard callback function
         * @param  {Function}    callback.gh    Global data object containing information on the user, the app configuration and the APIs
         * @private
         */
        var initGH = function(callback) {
            // Redirect if an unsupported browser is used, don't assume jQuery is usable
            /* istanbul ignore if */
            if (document.getElementsByTagName('HTML')[0].className.indexOf('lt-ie9') > -1) {
                window.location = '/unsupported';
            }

            // Check if the user is browsing from a handheld device
            var isHandheld = false;
            /* istanbul ignore next */
            _.each([navigator.userAgent || navigator.vendor || window.opera], function(a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
                    isHandheld = true;
                }
            });

            // Redirect the user when they are browsing from a handheld device
            /* istanbul ignore next */
            if (isHandheld && window.location.pathname !== '/mobile') {
                window.location = '/mobile';
            }

            // Load the me feed
            userAPI.getMe(function(err, me) {
                /* istanbul ignore else */
                if (!err) {
                    gh.data.me = me;
                } else {
                    // Intercept 503 status indicating that the server is down
                    if (err.code === 503) {
                        gh.utils.redirect().unavailable();
                    }
                }

                // Get the app configuration
                getConfig(function() {
                    // pre-cache partials that can't be conveniently lazy-loaded
                    utils.cachePartials(function() {
                        // Set up instrumentation
                        /* istanbul ignore if */
                        if (gh.config.enableAnalytics) {
                            utils.setUpInstrumentation(gh.data.me, gh.config.analyticsTrackingId, gh.config.enableAnalytics, function() {
                                // The APIs have now fully initialised. All javascript that
                                // depends on the initialised core APIs can now execute
                                return callback(gh);
                            });
                        } else {
                            return callback(gh);
                        }
                    });
                });
            });
        };

        /**
         * Get the app configuration, except if the global admin page is loaded up
         *
         * @param  {Function}    callback    Standard callback function
         * @throws {Error}                   Standard error
         * @private
         */
        var getConfig = function(callback) {
            // Don't attempt to fetch any configuration when the global admin UI or QUnit
            // is loaded up as it has its own way of dealing with configuration
            /* istanbul ignore else */
            if ($('body').hasClass('gh-global-admin') || $('body').data('isqunit')) {
                callback();
            // Fetch the configuration and cache it on the global gh object when we're loading
            // up the student UI or student admin UI
            } else {
                configAPI.getConfig(null, function(err, config) {
                    if (err) {
                        throw new Error('The configuration for the app could not be retrieved');
                    }

                    // Show a message to the user informing them that the app hasn't been properly configured
                    // if the academicYear hasn't been set
                    if (!config.terms[config.academicYear]) {
                        gh.utils.notification('App is not configured', 'The application has not yet been properly configured for an academic year', 'error', null, true);
                    }

                    // Cache the config on the global gh.data object
                    gh.config = config;

                    // Continue the startup procedure
                    callback();
                });
            }
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
