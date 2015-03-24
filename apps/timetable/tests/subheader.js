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

casper.test.begin('Student - Component - Subheader', function(test) {

    /**
     * Verify the subheader
     */
    var verifySubHeader = function() {
        casper.waitForSelector('#gh-right-container #gh-header h1', function() {
            casper.waitForSelector('#gh-left-container #gh-meta-container #gh-content-description', function() {
                test.assertExists('#gh-left-container #gh-meta-container #gh-content-description', 'Verify that the subheader has a content description');
                test.assertSelectorHasText('#gh-left-container #gh-meta-container #gh-content-description', 'Choose a tripos & part to see available modules', 'Verify that the subheader has the correct content description');
                casper.waitForSelector('#gh-subheader #gh_subheader_tripos_chosen.chosen-container', function() {
                    test.assertExists('#gh-subheader #gh_subheader_tripos_chosen.chosen-container', 'Verify that the subheader has a tripos picker');
                    // Open the tripos picker
                    casper.click('#gh-subheader #gh_subheader_tripos_chosen.chosen-container');
                    // Verify that the tripos picker opens and a selection can be made
                    casper.waitUntilVisible('#gh-subheader #gh_subheader_tripos_chosen.chosen-container .chosen-results', function() {
                        test.assertVisible('#gh-subheader #gh_subheader_tripos_chosen.chosen-container .chosen-results', 'Verify that the tripos picker opens after clicking the input');
                        // Click the first item and verify that the part picker becomes available
                        casper.click('#gh-subheader #gh_subheader_tripos_chosen.chosen-container .chosen-results .group-result:first-child + .active-result');
                        casper.waitForSelector('#gh-subheader #gh_subheader_part_chosen.chosen-container', function() {
                            test.assertExists('#gh-subheader #gh_subheader_part_chosen.chosen-container', 'Verify that the part picker becomes available after selecting a tripos');
                            // Verify that the url is updated to reflect the selected tripos
                            test.assertEval(function() {
                                return !!History.getState().data.tripos;
                            }, 'Verify that the url is updated to reflect the selected tripos');
                            // Open the part picker
                            casper.click('#gh-subheader #gh_subheader_part_chosen.chosen-container');
                            // Verify that the part picker opens and a selection can be made
                            casper.waitUntilVisible('#gh-subheader #gh_subheader_part_chosen.chosen-container .chosen-results', function() {
                                test.assertVisible('#gh-subheader #gh_subheader_part_chosen.chosen-container .chosen-results', 'Verify that the part picker opens after clicking the input');
                                // Click the first item
                                casper.click('#gh-subheader #gh_subheader_part_chosen.chosen-container .chosen-results .active-result');
                                // Verify that the url is updated to reflect the selected part
                                test.assertEval(function() {
                                    return !!History.getState().data.part;
                                }, 'Verify that the url is updated to reflect the selected part');
                            });
                        });
                    });
                });
            });
        });
    };

    /**
     * Verify the subheader as a logged in user
     *
     * @param {User}    user    User object to test with
     */
    var verifySubHeaderLoggedIn = function(user) {
        casper.waitForSelector('#gh-right-container #gh-header .gh-signin-form', function() {
            casper.fill('#gh-right-container #gh-header .gh-signin-form', {
                'username': user.email,
                'password': user.password
            }, false);
            casper.click('#gh-right-container #gh-header .gh-signin-form button[type="submit"]');

            // Wait for the login to succeed
            casper.waitForSelector('#gh-signout-form button[type="submit"]', function() {
                verifySubHeader();
            });
        });
    };

    // Create a user to test with
    // userAPI.createUsers(1, false, function(user1) {

        // Open the tenant UI
        // casper.thenOpen(configAPI.tenantUI, function() {
        //     casper.then(function() {
        //         casper.echo('# Verify the page subheader as an anonymous user', 'INFO');
        //         verifySubHeader();
        //     });
        //     casper.then(function() {
        //         casper.echo('# Verify the page subheader as a logged in user', 'INFO');
        //         verifySubHeaderLoggedIn(user1);
        //     });
        // });
    // });

    casper.run(function() {
        test.done();
    });
});
