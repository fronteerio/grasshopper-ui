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

define(['gh.core', 'jquery.jeditable'], function(gh) {

    // Create a custom jEditable select box
    $.editable.addInputType('event-type-select', {
        'element' : function(settings, original) {
            var content = gh.api.utilAPI.renderTemplate($('#gh-event-type-template'), {
                'data': {
                    'id': 'gh-event-select-' + String(Math.ceil(Math.random() * 10000)),
                    // TODO: retrieve these values from the config
                    'types': {
                        'field_trip':'Field Trip',
                        'lab':'Lab',
                        'lecture':'Lecture',
                        'paper':'Paper',
                        'seminar':'Seminar'
                    }
                }
            });
            $(this).append(content);
            // Add a hidden input field that stores the selected value
            var hidden = $('<input type="hidden">');
            $(this).append(hidden);
            return(hidden);
        },
        'content': function(string, settings, original) {
            var eventType = $(original).attr('data-type');
            if (eventType) {
                $(this).find('select option[value="' + eventType + '"]').attr('selected', 'selected');
            }
        },
        'plugin': function(settings, original) {
            $('select', this).on('change', function() {
                $(this).parent().find('input[type="hidden"]').val($(this).val());
                $(this).closest('td').attr('data-type', $(this).val());
                $(this).closest('form').trigger('submit');
            });
        }
    });
});
