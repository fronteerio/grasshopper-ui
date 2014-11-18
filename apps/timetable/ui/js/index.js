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

define(['exports', 'gh.core'], function(exports, gh) {

    /**
     * Render the header
     */
    var renderHeader = function() {
        gh.api.utilAPI.renderTemplate($('#gh-header-template'), {
            'gh': gh
        }, $('#gh-header'));
    };

    /**
     * Render the subheader
     */
    var renderSubheader = function() {

    };

    /**
     * Render the content of the page
     */
    var renderContent = function() {

    };

    var doLogin = function() {
        var formValues = _.object(_.map($(this).serializeArray(), _.values));
        gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
            if (!err) {
                window.location = '/';
            } else {
                // Show an error to the user
            }
        });

        return false;
    };

    var addBinding = function() {
        $('body').on('click', '#gh-signout', gh.api.authenticationAPI.logOut);
        $('body').on('submit', '#gh-signin-form', doLogin);
    };

    /**
     * Initialise the index page
     */
    var initIndex = function() {
        addBinding();
        renderHeader();
        renderSubheader();
        renderContent();
    };

    initIndex();
});
