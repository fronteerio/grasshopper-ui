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

define(['gh.core', 'jquery-autosuggest'], function(gh) {

    /**
     * Set up the autosuggest field in the batch edit header
     */
    var setUpAutoSuggest = function() {
        $('#gh-batch-edit-organisers').autoSuggest('/api/users', {
            'minChars': 2,
            'neverSubmit': true,
            'retrieveLimit': 10,
            'url': '/api/users',
            'searchObjProps': 'id, displayName',
            'selectedItemProp': 'displayName',
            'selectedValuesProp': 'id',
            'startText': 'Lecturers',
            'usePlaceholder': true,
            'retrieveComplete': function(data) {
                return data.results;
            },
            'selectionAdded': function(elem, id) {
                // Construct the user object that was added
                var user = {
                    'id': id,
                    'displayName': elem.text()
                };
            },
            'selectionRemoved': function(elem, id) {
                // Construct the user object that was removed
                var user = {
                    'id': id,
                    'displayName': elem.text()
                };
            }
        });
    };

    /**
     * Add binding to various autosuggest elements
     */
    var addBinding = function() {
        $(document).on('gh.batchorganiser.setup', setUpAutoSuggest);
    };

    addBinding();
});
