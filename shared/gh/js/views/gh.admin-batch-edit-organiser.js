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

define(['gh.core', 'jquery-autosuggest'], function(gh) {

    /**
     * Get the user objects from the batch edit AutoSuggest field
     *
     * @return {User[]}    Array of user objects chosen in the batch edit AutoSuggest field
     * @private
     */
    var getBatchSelection = function() {
        // Used to store the user information
        var batchSelection = [];

        // Loop over each item in the AutoSuggest field and create a basic user object
        _.each($('#gh-batch-edit-header .as-selection-item'), function($user) {
            $user = $($user);

            batchSelection.push({
                'id': $user.data('value').toString(),
                'displayName': $user.text().slice(1)
            });
        });

        // Return the Array of user objects
        return batchSelection;
    };

    /**
     * Update a given organiser field in the DOM
     *
     * @param  {jQuery}    $field    jQuery selector of the td element that makes up the organiser field
     * @private
     */
    var updateOrganiserField = function($field) {
        $field = $($field);

        // Retrieve the values from the AutoSuggest field and create a String to show
        var $hiddenFields = $field.prev('.gh-event-organisers-fields').find('input[data-add="true"]');
        var organisers = [];

        // Create the stringified organiser Array
        _.each($hiddenFields, function(hiddenField) {
            organisers.push(hiddenField.value);
        });

        // Mark the row as edited
        $field.closest('tr').addClass('active');

        // Return the stringified organisers
        $field.text(organisers.join(', '));
    };

    /**
     * Set up the autosuggest field in the batch edit header
     *
     * @private
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
                // Get the batch added users
                var batchOrganisers = getBatchSelection();
                // Update each selected row's organisers
                var $rows = $('.gh-batch-edit-events-container tr.info');

                // Only add these users, the rest should be marked as data-add="false"
                // First, Mark all present hidden fields as 'data-add="false"'
                _.each($rows, function($row) {
                    $row = $($row);

                    // Get all hidden fields in the row
                    var $hiddenFields = $row.find('.gh-event-organisers-fields');

                    // Mark all hidden fields as data-add="false"
                    $hiddenFields.find('input').attr('data-add', false);

                    // Now loop over all added organisers and add them to the hidden fields or set the
                    // data-add back to true if the organiser was already added before
                    _.each(batchOrganisers, function(user) {
                        if ($hiddenFields.find('input[value="' + user.displayName + '"]').length) {
                            // The hidden field exists already, make sure it's marked as 'to add'
                            $hiddenFields.find('input[value="' + user.displayName + '"]').attr('data-add', true);

                        // Create the hidden field if it doesn't exist yet
                        } else {
                            // Create the hidden field element
                            $field = $('<input type="hidden" name="gh-event-organiser" value="' + user.displayName + '" data-add="true">');

                            // Try to parse the ID, if it fails that means we have a new user, not in the system
                            var hasId = false;
                            try {
                                hasId = parseInt(user.id, 10);
                            } catch (err) {
                                hasId = false;
                            }

                            // If the user exists in the system, add the ID to the hidden field
                            if (hasId) {
                                $field.attr('data-id', user.id);
                            }

                            // Add the hidden field
                            $row.find('.gh-event-organisers-fields').append($field);
                        }
                    });

                    // Update the organiser field
                    updateOrganiserField($row.find('.gh-event-organisers'));
                });

                // Let the batch edit know that updates happened
                $(document).trigger('gh.batchedit.togglesubmit');
            },
            'selectionRemoved': function(elem, id) {
                // Construct the user object that was removed
                var user = {
                    'id': $(elem).data('value').toString(),
                    'displayName': elem.text().slice(1)
                };

                // Update each selected row's organisers
                var $rows = $('.gh-batch-edit-events-container tr.info');

                _.each($rows, function($row) {
                    $row = $($row);

                    // Update the hidden fields
                    var $hiddenFields = $row.find('.gh-event-organisers-fields');

                    // Update the hidden field if it exists already
                    if ($hiddenFields.find('input[value="' + user.displayName + '"]').length) {
                        // The hidden field exists already, make sure it's NOT marked as 'to add'
                        $hiddenFields.find('input[value="' + user.displayName + '"]').attr('data-add', false);
                    }

                    // Update the organiser field
                    updateOrganiserField($row.find('.gh-event-organisers'));
                });

                // Remove the element from the AutoSuggest field
                elem.remove();

                // Let the batch edit know that updates happened
                $(document).trigger('gh.batchedit.togglesubmit');
            }
        });
    };

    /**
     * Add binding to various autosuggest elements
     *
     * @private
     */
    var addBinding = function() {
        $(document).on('gh.batchorganiser.setup', setUpAutoSuggest);
    };

    addBinding();
});
