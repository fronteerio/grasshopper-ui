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

define(['gh.core'], function(gh) {

    /**
     * Set up the footer component
     *
     * @private
     */
    var setUpFooter = function() {
        // Render the header template
        gh.utils.renderTemplate('footer', {
            'data': {
                'me': gh.data.me
            }
        }, null, function(renderedFooter) {
            $('footer').replaceWith(renderedFooter);
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
        $(document).on('gh.header.init', setUpFooter);

        // Track an event when the user clicks the Cambridge logo
        $('body').on('click', 'footer .gh-uni-logo', function() {
            gh.utils.trackEvent(['Navigation', 'Cambridge Logo clicked'], null, null, function() {
                window.location = '/';
            });
        });
    };

    addBinding();
});
