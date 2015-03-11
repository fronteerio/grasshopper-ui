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

casper.test.begin('Student - Component - Modules', function(test) {

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
     * Verify the modules in the sidebar
     */
    var verifyModules = function() {
        // Open modules in the sidebar
        openModules();
        casper.then(function() {
            // Wait for the modules to be available before starting the test
            casper.waitForSelector('#gh-left-container #gh-modules-list li', function() {
                // Verify the result summary
                test.assertExists('#gh-left-container #gh-result-summary', 'Verify that the result summary is shown');
                var moduleCount = casper.evaluate(function() {
                    return $('#gh-left-container #gh-modules-list > li').length;
                });
                test.assertSelectorHasText('#gh-left-container #gh-result-summary', moduleCount + ' modules in this part', 'Verify that the result summary shows the correct number of modules found');
                // Verify the module item
                test.assertExists('#gh-left-container #gh-modules-list > li:first-child button.gh-toggle-list', 'Verify that the module toggle is present');
                test.assertExists('#gh-left-container #gh-modules-list > li:first-child button.gh-toggle-list .gh-list-icon i', 'Verify that the module toggle icon is present');
                test.assertExists('#gh-left-container #gh-modules-list > li:first-child .gh-list-description p', 'Verify that the module title is present');
                test.assertExists('#gh-left-container #gh-modules-list > li:first-child .gh-list-action', 'Verify that the module actions are present');
                test.assertExists('#gh-left-container #gh-modules-list > li:first-child .gh-list-action button.gh-add-all-to-calendar', 'Verify that the default action for modules is \'Add all to calendar\'');
                // Verify that clicking the button as anonymous triggers a login modal
                casper.click('#gh-left-container #gh-modules-list > li:first-child .gh-list-action button.gh-add-all-to-calendar');
                casper.waitUntilVisible('#gh-modal-login', function() {
                    test.assertVisible('#gh-modal-login', 'Verify that clicking the button as anonymous triggers a login modal');
                    casper.click('#gh-modal-login button[data-dismiss="modal"]');
                    casper.waitWhileSelector('body.modal-open', function() {
                        test.assertNotVisible('#gh-modal-login', 'Verify that the modal was dismissed before continuing the test');
                    });
                });
            });
        });
    };

    /**
     * Verify the module series in the sidebar
     */
    var verifySeries = function() {
        // Open up the first module. Clearing the local storage from within CasperJS doesn't work as PhantomJS has special handling for it in place.
        // There's an open issue in the PhantomJS tracker to disable localStorage https://github.com/ariya/phantomjs/pull/404.
        // Until it's fixed we'll have to either manually 'revert' changes that get pushed into localStorage or do checks.
        var open = casper.evaluate(function() {
            return $('#gh-left-container #gh-modules-list > li:first-child ul li').is(':visible');
        });
        if (!open) {
            casper.click('#gh-left-container #gh-modules-list > li:first-child button.gh-toggle-list');
        }
        casper.waitUntilVisible('#gh-left-container #gh-modules-list > li:first-child ul li', function() {
            test.assertExists('#gh-left-container #gh-modules-list > li:first-child ul li', 'Verify that clicking the module toggle button shows the series');
            // Verify the series item
            test.assertExists('#gh-left-container #gh-modules-list > li:first-child ul li:first-child .gh-list-description', 'Verify that the series title is present');
            test.assertExists('#gh-left-container #gh-modules-list > li:first-child ul li:first-child .gh-list-action', 'Verify that the series actions are present');
            test.assertExists('#gh-left-container #gh-modules-list > li:first-child ul li:first-child .gh-list-action button.gh-add-to-calendar', 'Verify that the default action for series is \'Add to calendar\'');
            // Verify that clicking the button as anonymous triggers a login modal
            casper.click('#gh-left-container #gh-modules-list > li:first-child ul li:first-child .gh-list-action button.gh-add-to-calendar');
            casper.waitUntilVisible('#gh-modal-login', function() {
                test.assertVisible('#gh-modal-login', 'Verify that clicking the button as anonymous triggers a login modal');
                casper.click('#gh-modal-login button[data-dismiss="modal"]');
                casper.waitWhileSelector('body.modal-open', function() {
                    test.assertNotVisible('#gh-modal-login', 'Verify that the modal was dismissed before continuing the test');
                });
            });
        });
    };

    casper.start(configAPI.tenantUI, function() {
        casper.then(function() {
            casper.echo('# Verify the modules', 'INFO');
            verifyModules();
        });

        casper.then(function() {
            casper.echo('# Verify the module series', 'INFO');
            verifySeries();
        });
    });

    casper.run(function() {
        test.done();
    });
});
