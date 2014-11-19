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

define(['exports'], function(exports) {

    /**
     * Generates a random 10 character sequence of upper and lowercase letters.
     *
     * @param  {Boolean}    toLowerCase    Whether or not the string should be returned lowercase
     * @return {String}                    Random 10 character sequence of upper and lowercase letters
     */
    var generateRandomString = exports.generateRandomString = function(toLowerCase) {
        var rndString = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        for (var i = 0; i < 10; i++) {
            rndString += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        if (toLowerCase) {
            rndString = rndString.toLowerCase();
        }
        return rndString;
    };

    /**
     * Render a template and either return the HTML or populate a target container with the result
     *
     * @param  {Element|String}    $template    jQuery element representing the HTML element that contains the template or jQuery selector for the template container
     * @param  {Object}            [data]       JSON object representing the values used to process the template
     * @param  {Element|String}    [$target]    jQuery element representing the HTML element in which the template output should be put, or jQuery selector for the output container
     *
     * @return {String}                         The rendered HTML
     * @throws {Error}                          Error thrown when no template has been provided
     */
    var renderTemplate = exports.renderTemplate = function($template, data, $target) {
        if (!$template) {
            throw new Error('No valid template has been provided');
        }

        // Make sure we're dealing with jQuery objects
        $template = $($template);
        $target = $($target);

        // Compile the template
        var compiled = _.template($template.text());
        compiled = compiled(data);

        // If a target container was specified, render the HTML into it
        if ($target.length) {
            $target.html(compiled);
        }

        // Always return the rendered HTML string
        return compiled;
    };
});
