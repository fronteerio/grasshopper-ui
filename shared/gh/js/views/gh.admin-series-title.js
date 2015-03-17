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

define(['gh.core', 'jquery.jeditable'], function(gh) {

    // Create a custom jEditable select box
    $.editable.addInputType('series-title', {

        /**
         * Create a form element and attach it to the generated form.
         * The form is available inside the function as variable this.
         *
         * @param  {Object}    settings    the jEditable field settings
         * @param  {String}    original    the containing HTML element
         * @private
         */
        'element' : function(settings, original) {
            var input = $('<input maxlength="' + settings.maxlength + '" name="value" placeHolder="' + settings.placeholder + '">');
            $(this).append(input);
            return(input);
        },

        /**
         * Extend the jEditable behaviour with custom logic
         *
         * @param  {Object}    settings    the jEditable field settings
         * @param  {String}    original    the containing HTML element
         * @private
         */
        'plugin': function(settings, original) {
            // Add an `editing` class when the input field is being focussed
            $('input', this).on('focus', function() {
                $(original).addClass('editing');
            });
        }
    });
});
