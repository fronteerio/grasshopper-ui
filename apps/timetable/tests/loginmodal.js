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

casper.test.begin('Student - Component - Login Modal', function(test) {

    /**
     * Add some modules to the sidebar by selecting a tripos and part in the pickers
     */
    var openModules = function() {
        casper.waitForSelector('#gh-right-container #gh-header h1', function() {
            casper.evaluate(function() {
                require('gh.core').utils.addToState({
                    'tripos': 5,
                    'part': 6
                });
            });
        });
    };

    /**
     * Verify the login modal
     *
     * @param {User}    user    User object to test with
     */
    var verifyLogInModal = function(user) {
        // Open modules in the sidebar
        openModules();
        casper.then(function() {
            // Wait for the modules to be available before starting the test
            casper.waitForSelector('#gh-left-container #gh-modules-list li', function() {
                // Open the login modal
                casper.click('#gh-left-container #gh-modules-list > li:first-child .gh-list-action button.gh-add-all-to-calendar');
                casper.waitUntilVisible('#gh-modal-login', function() {
                    test.assertVisible('#gh-modal-login', 'Verify that adding an event to the calendar as anonymous triggers the login modal');

                    // Verify the title
                    test.assertExists('#gh-modal-login h4.modal-title', 'Verify that the login modal title is present');
                    test.assertSelectorHasText('#gh-modal-login h4.modal-title', 'Already have a timetable or want one?', 'Verify that the login modal title has the correct text');

                    // Verify the login form
                    test.assertExists('#gh-modal-login .gh-signin-form', 'Verify that the login modal is present');
                    test.assertExists('#gh-modal-login .gh-signin-form #gh-signin-email', 'Verify that the login modal email field is present');
                    test.assertExists('#gh-modal-login .gh-signin-form #gh-signin-password', 'Verify that the login modal password field is present');
                    test.assertExists('#gh-modal-login .gh-signin-form button[type="submit"]', 'Verify that the login modal submit button is present');

                    // Verify the close buttons
                    test.assertExists('#gh-modal-login .modal-header button[data-dismiss="modal"]', 'Verify that the close button is present in the header');
                    test.assertExists('#gh-modal-login .modal-footer button[data-dismiss="modal"]', 'Verify that the close button is present in the footer');

                    // Verify that the buttons dismiss the modal
                    casper.click('#gh-modal-login .modal-header button[data-dismiss="modal"]');
                    casper.waitWhileSelector('body.modal-open', function() {
                        test.assertNotVisible('#gh-modal-login', 'Verify that the modal was dismissed by clicking the header button');

                        // Open the login modal
                        casper.click('#gh-left-container #gh-modules-list > li:first-child .gh-list-action button.gh-add-all-to-calendar');
                        casper.waitUntilVisible('#gh-modal-login', function() {
                            test.assertVisible('#gh-modal-login', 'Verify that adding an event to the calendar as anonymous triggers the login modal');

                            casper.click('#gh-modal-login .modal-footer button[data-dismiss="modal"]');
                            casper.waitWhileSelector('body.modal-open', function() {
                                test.assertNotVisible('#gh-modal-login', 'Verify that the modal was dismissed by clicking the footer button');

                                // Open the login modal
                                casper.click('#gh-left-container #gh-modules-list > li:first-child .gh-list-action button.gh-add-all-to-calendar');
                                casper.waitUntilVisible('#gh-modal-login', function() {
                                    test.assertVisible('#gh-modal-login', 'Verify that adding an event to the calendar as anonymous triggers the login modal');

                                    // Verify that the form logs the user in
                                    casper.fill('#gh-modal-login .gh-signin-form', {
                                        'username': user.email,
                                        'password': user.password
                                    }, false);
                                    casper.click('#gh-modal-login .gh-signin-form button[type="submit"]');

                                    // Wait for the login to succeed
                                    casper.waitForSelector('#gh-signout-form button[type="submit"]', function() {
                                        test.assertExists('#gh-signout-form button[type="submit"]', 'Verify that the login succeeded');
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    // Create a user to test with
    userAPI.createUsers(1, false, function(user1) {

        // Open the tenant UI
        casper.thenOpen(configAPI.tenantUI, function() {
            casper.then(function() {
                casper.echo('# Verify the login modal', 'INFO');
                verifyLogInModal(user1);
            });

            casper.then(function() {
                userAPI.doLogOut();
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
