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

require(['gh.core', 'gh.api.tests'], function(gh, testAPI) {
    module('Util API');

    // Add a template to the page
    $('body').append('<script id="qunit-template" type="text/template">Hi, <%= name %></script>');
    // Create the data to use in the template
    var templateData = {
        'name': 'Mathieu'
    };
    // Add a target container to the page
    $('body').append('<div id="qunit-template-target" style="display: none;"></div>');

    // Test the renderTemplate functionality
    QUnit.test('renderTemplate', function(assert) {
        // Verify that a template needs to be provided
        assert.throws(function() {
            gh.api.utilAPI.renderTemplate(null, templateData, $('#qunit-template-target'));
        }, 'Verify that a template needs to be provided');

        // Verify that the template renders in the target container
        gh.api.utilAPI.renderTemplate($('#qunit-template'), templateData, $('#qunit-template-target'));
        assert.equal($('#qunit-template-target').text(), 'Hi, Mathieu', 'Verify the template HTML is rendered in the target container when specified');

        // Verify that the rendered HTML is returned when no target is specified
        var returnedHTML = gh.api.utilAPI.renderTemplate($('#qunit-template'), templateData);
        assert.equal(returnedHTML, 'Hi, Mathieu', 'Verify the rendered HTML returns when no target container is specified');
    });

    testAPI.init();
});
