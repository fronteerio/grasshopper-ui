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

define(['gh.core', 'gh.login-form'], function(gh) {


    /////////////
    // BINDING //
    /////////////

    /**
     * Render the mobile view
     *
     * @private
     */
    var renderMobile = function() {
        // Render the header
        gh.utils.renderTemplate('header', {
            'data': {
                'gh': gh,
                'includeLoginForm': false
            }
        }, $('#gh-header'));

        // Render the login form if the user isn't logged in yet
        if (gh.data.me.anon) {
            gh.utils.renderTemplate('login-form', {
                'data': {
                    'gh': gh
                }
            }, $('main'));
        // Render the export functionality if the user is logged in
        } else {
            gh.utils.renderTemplate('mobile-export', {
                'data': {
                    'gh': gh
                }
            }, $('main'));
        }
    };

    renderMobile();
});
