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

    // Keep track of when the user started
    var timeFromStart = null;
    var isStarted = false;

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
        _.each($('.gh-batch-event-organisers .as-selection-item'), function($user) {
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
     * Reset the AutoSuggest component by deleting all of its selected users
     *
     * @private
     */
    var resetAutoSuggest = function() {
        // For each of the users, click the `remove` button
        _.each($('.gh-batch-event-organisers .as-selection-item .as-close'), function($close) {
            $($close).click();
        });
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
     * Track a selection event
     *
     * @param  {Object}    elem    The DOM element that was added after a selection
     * @private
     */
    var trackSelectionEvent = function(elem) {
        // Try to parse the ID, if it fails that means we have a new user, not in the system
        var hasId = false;
        try {
            hasId = parseInt($(elem).data('value'), 10);
        } catch (err) {
            hasId = false;
        }

        if (hasId) {
            // Track the user editing the organisers
            gh.utils.trackEvent(['Data', 'Batch edit', 'Lecturer edit', 'Autocomplete userID selected']);
        } else {
            // Track the user editing the organisers as freetext
            gh.utils.trackEvent(['Data', 'Batch edit', 'Lecturer edit', 'Freetext entered']);
        }
    };

    /**
     * Set up the autosuggest field in the batch edit header
     *
     * @private
     */
    var setUpAutoSuggest = function() {
        $('#gh-batch-edit-organisers').onAvailable(function() {
            $('#gh-batch-edit-organisers').autoSuggest('/api/users', {
                'minChars': 2,
                'neverSubmit': true,
                'retrieveLimit': 10,
                'url': '/api/users',
                'searchObjProps': 'id, displayName',
                'selectedItemProp': 'displayName',
                'selectedValuesProp': 'id',
                'startText': 'Lecturers (0)',
                'usePlaceholder': true,
                'resultsComplete': function() {
                    // Track the user if no results come up
                    if (!$('#gh-batch-edit-organisers').find('.as-results li.as-result-item').length) {
                        gh.utils.trackEvent(['Data', 'Batch edit', 'Lecturer edit', 'Autocomplete no results shown']);
                    }
                },
                'retrieveComplete': function(data) {
                    // Append the shibbolethId to the displayName to make it easier to distinguish between users
                    _.each(data.results, function(user) {
                        var suffix = user.shibbolethId ? ' (' + user.shibbolethId + ')' : '';
                        user.displayName = user.displayName + suffix;
                    });
                    return data.results;
                },
                'selectionAdded': function(elem, id) {
                    trackSelectionEvent(elem);
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

                    // Update the lecture count in the placeholder
                    updateAutoSuggestPlaceholder();

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

                    // Track the user removing an AutoSuggest field
                    gh.utils.trackEvent(['Data', 'Batch edit', 'Lecturer edit', 'Item removed']);

                    // Update the lecture count in the placeholder
                    updateAutoSuggestPlaceholder();

                    // Let the batch edit know that updates happened
                    $(document).trigger('gh.batchedit.togglesubmit');
                }
            });

            // Style the Autosuggest as disabled by default
            $('.gh-batch-event-organisers .as-selections').addClass('gh-disabled');
        });
    };

    /**
     * Update the AutoSuggest component placeholder text with 'Lecturers (x)' where `x` is the number
     * of selected lecturers in the AutoSuggest component
     *
     * @private
     */
    var updateAutoSuggestPlaceholder = function() {
        $('.gh-batch-event-organisers .as-original input').attr('placeholder', 'Lecturers (' + $('.gh-batch-event-organisers .as-selection-item').length + ')');
    };

    /**
     * Close the AutoSuggest component by adding a class to it's parent that will hide all selected users from view
     *
     * @param  {Event}    ev    Standard jQuery event
     * @private
     */
    var closeAutoSuggest = function(ev) {
        // Only close the input if the focus was lost on an element outside of the organiser container
        if (!$(ev.target).closest('.gh-batch-event-organisers').length || (ev.relatedTarget && !$(ev.relatedTarget).closest('.gh-batch-event-organisers').length)) {
            $('.gh-batch-event-organisers').addClass('gh-batch-event-collapsed');
            // Update the lecture count in the placeholder
            updateAutoSuggestPlaceholder();
            // Calculate how long it takes the user to change the date
            timeFromStart = (new Date() - timeFromStart) / 1000;
            // Track the user editing organisers
            gh.utils.trackEvent(['Data', 'Batch edit', 'Lecturer edit', 'Completed'], {
                'time_from_start': timeFromStart
            });
            // Set the autosuggest mode to stopped
            isStarted = false;
        }
    };

    /**
     * Open the AutoSuggest component by removing the class from it's parent that hides all selected users from view
     *
     * @param {Object}    ev    Standard jQuery event object
     * @private
     */
    var openAutoSuggest = function(ev) {
        $('.gh-batch-event-organisers').removeClass('gh-batch-event-collapsed');
        // Update the lecture count in the placeholder
        updateAutoSuggestPlaceholder();
        if (!isStarted) {
            // Track how long the user takes to adjust the organisers
            timeFromStart = new Date();
            // Track the user editing the organisers
            gh.utils.trackEvent(['Data', 'Batch edit', 'Lecturer edit', 'Started']);
            // Set the autosuggest mode to started
            isStarted = true;
        }
    };

    /**
     * Add binding to various autosuggest elements
     *
     * @private
     */
    var addBinding = function() {
        // Set up the AutoSuggest
        $(document).on('gh.batchorganiser.setup', setUpAutoSuggest);
        // Reset the AutoSuggest
        $(document).on('gh.batchorganiser.reset', resetAutoSuggest);
        // Close the AutoSuggest when the body is clicked
        $(document).on('click', 'body', closeAutoSuggest);
        // Close the AutoSuggest when the component loses focus
        $(document).on('focusout', '.gh-batch-event-organisers .as-original input', closeAutoSuggest);
        // Open the AutoSuggest when the component gains focus
        $(document).on('focusin', '.gh-batch-event-organisers .as-original input', openAutoSuggest);
    };

    addBinding();
});
