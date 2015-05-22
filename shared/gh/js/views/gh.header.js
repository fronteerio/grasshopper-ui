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
     * @param  {Boolean}    includeLoginForm    Whether or not the login form should be displayed
     * @param  {Boolean}    isGlobalAdminUI     Whether or not the global admin UI is in use
     * @param  {Object}     [triposData]        Object containing the tripos data
     * @private
     */
    var setUpHeader = function(includeLoginForm, isGlobalAdminUI, triposData) {
        // Render the header template
        gh.utils.renderTemplate('header', {
            'data': {
                'gh': gh,
                'includeLoginForm': includeLoginForm,
                'isGlobalAdminUI': isGlobalAdminUI
            }
        }, $('#gh-header'), function() {

            // Only render the pickers for the student UI and the tenant admin UI
            if (!isGlobalAdminUI && (!gh.data.me.anon || $('body').hasClass('gh-student'))) {

                // Select a picker template based on the UI we're in
                var pickerTemplate = 'subheader-pickers';
                if ($('body').hasClass('gh-admin')) {
                    pickerTemplate = 'admin-subheader-pickers';
                }

                // Render the tripos pickers
                gh.utils.renderTemplate(pickerTemplate, {
                    'gh': gh
                }, $('#gh-subheader'), function() {
                    // Initialise the subheader component
                    $(document).trigger('gh.subheader.init', {
                        'triposData': triposData
                    });
                });
            }
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
            var includeLoginForm = msg.includeLoginForm || false;
            var isGlobalAdminUI = msg.isGlobalAdminUI || false;
            var triposData = msg.triposData || null;
            setUpHeader(includeLoginForm, isGlobalAdminUI, triposData);
        });

        // Track an event when the user clicks the Cambridge logo
        $('body').on('click', '#gh-left-container .gh-uni-logo', function() {
            gh.utils.trackEvent(['Navigation', 'Cambridge Logo clicked'], null, null, function() {
                window.location = '/';
            });
        });
    };

    addBinding();
});
