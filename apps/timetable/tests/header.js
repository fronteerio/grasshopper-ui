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

casper.test.begin('Component - Header', function(test) {

    /**
     * Verify the admin page header
     */
    var verifyHeader = function() {
        casper.echo('# Verify the timetable header', 'INFO');
        casper.waitForSelector('#gh-right-container #gh-header', function() {
            test.assertExists('#gh-left-container #gh-header-logo img', 'Verify the header hero has the Cambridge University logo');
            test.assertExists('#gh-right-container #gh-header h1', 'Verify the header has a header h1');
            test.assertSelectorHasText('#gh-right-container #gh-header h1', 'My timetable', 'Verify the header has the text \'My timetable\'');
            test.assertExists('#gh-right-container #gh-header .gh-signin-form', 'Verify the header has a login form');
        });
    };

    /**
     * Verify the admin page body
     */
    var verifyLogInForm = function() {
        casper.echo('# Verify the timetable login form', 'INFO');
        casper.waitForSelector('#gh-right-container #gh-header .gh-signin-form', function() {
            test.assertExists('#gh-right-container #gh-header .gh-signin-form label[for="gh-signin-email"]', 'Verify the login form has an email label');
            test.assertExists('#gh-right-container #gh-header .gh-signin-form input#gh-signin-email', 'Verify the login form has an email field');
            test.assertExists('#gh-right-container #gh-header .gh-signin-form label[for="gh-signin-password"]', 'Verify the login form has a password label');
            test.assertExists('#gh-right-container #gh-header .gh-signin-form input#gh-signin-password', 'Verify the login form has a password field');
            test.assertExists('#gh-right-container #gh-header .gh-signin-form button[type="submit"]', 'Verify the login form has a submit button');
        });
    };

    /**
     * Verify the login functionality
     */
    var verifyLogIn = function(user) {
        casper.echo('# Verify the timetable login functionality', 'INFO');
        casper.waitForSelector('#gh-right-container #gh-header .gh-signin-form', function() {
            casper.fill('#gh-right-container #gh-header .gh-signin-form', {
                'username': user.email,
                'password': user.password
            }, false);
            casper.click('#gh-right-container #gh-header .gh-signin-form button[type="submit"]');

            // Wait for the login to succeed
            casper.waitForSelector('#gh-signout-form button[type="submit"]', function() {
                test.assertExists('#gh-signout-form button[type="submit"]', 'Verify that the login succeeded and the logout button is present');
            });
        });
    };

    /**
     * Verify the logout functionality
     */
    var verifyLogOut = function() {
        casper.echo('# Verify the timetable logout functionality', 'INFO');
        // Verify that the sign out button is present
        casper.waitForSelector('#gh-signout-form button[type="submit"]', function() {
            test.assertExists('#gh-signout-form button[type="submit"]', 'Verify that the logout button is present');
            casper.click('#gh-signout-form button[type="submit"]');

            casper.waitForSelector('#gh-right-container #gh-header .gh-signin-form', function() {
                test.assertExists('#gh-right-container #gh-header .gh-signin-form', 'Verify the logout was successful');
            });
        });
    };

    casper.start(configAPI.tenantUI, function() {
        // Create a user to test with
        userAPI.createUsers(1, function(user1) {
            casper.waitForSelector('body', function() {
                casper.then(verifyHeader);
                casper.then(verifyLogInForm);
                casper.then(function() {
                    verifyLogIn(user1);
                });
                casper.then(verifyLogOut);
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
