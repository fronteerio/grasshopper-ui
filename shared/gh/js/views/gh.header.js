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

define(['gh.core', 'gh.login-form', 'gh.subheader'], function(gh) {

    /**
     * Set up the header component by rendering the header and initialising the subheader component
     *
     * @param  {Object}    triposData
     * @private
     */
    var setUpHeader = function(triposData) {
        // Render the header template
        gh.utils.renderTemplate('header', {
            'data': {
                'gh': gh
            }
        }, $('#gh-header'), function() {
            // Render the tripos pickers
            gh.utils.renderTemplate('subheader-pickers', {
                'gh': gh
            }, $('#gh-subheader'), function() {
                // Initialise the subheader component
                $(document).trigger('gh.subheader.init', {
                    'triposData': triposData
                });
            });
        });
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements
     *
     * @private
     */
    var addBinding = function() {
        // Initialise the header
        $(document).on('gh.header.init', function(evt, msg) {
            setUpHeader(msg.triposData);
        });

        // Track an event when the user clicks the Cambridge logo
        $('body').on('click', '#gh-header-logo', function() {
            gh.utils.trackEvent(['Navigation', 'Cambridge Logo clicked'], null, null, function() {
                window.location = '/';
            });
        });
    };

    addBinding();
});
