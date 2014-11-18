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

casper.test.begin('Page - Admin', function(test) {

    /**
     * Verify the admin page header
     */
    var verifyHeader = function() {
        casper.echo('# Verify the administrator header', 'INFO');
        test.assertExists('#gh-header-hero img', 'Verify the header hero has the Cambridge University logo');
        test.assertExists('#gh-header-slogan h1', 'Verify the header slogan has a header');
        test.assertSelectorHasText('#gh-header-slogan h1', 'Timetable', 'Verify that the header slogan has the text \'Timetable\'');
    };

    /**
     * Verify the admin page body
     */
    var verifyBody = function() {
        casper.echo('# Verify the administrator body', 'INFO');
        test.assertExists('main form', 'Verify the body has a login form');
        test.assertExists('main form label[for="gh-login-email"]', 'Verify the login form has a email label');
        test.assertExists('main form input#gh-login-email', 'Verify the login form has a email field');
        test.assertExists('main form label[for="gh-login-password"]', 'Verify the login form has a password label');
        test.assertExists('main form input#gh-login-password', 'Verify the login form has a password field');
        test.assertExists('main form button[type="submit"]', 'Verify the login form has a submit button');
    };

    casper.start(configAPI.adminUI, function() {
        casper.waitForSelector('body', function() {
            casper.then(verifyHeader);
            casper.then(verifyBody);
        });
    });

    casper.run(function() {
        test.done();
    });
});
