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

define(['gh.api.series', 'gh.api.util', 'gh.api.event', 'gh.admin-constants'], function(seriesAPI, utilAPI, eventAPI, adminConstants) {


    ///////////////
    // UTILITIES //
    ///////////////

    /**
     * Enable editing of the series title
     *
     * @private
     */
    var renameSeries = function() {
        $('.gh-jeditable-series-title').click();
    };

    /**
     * Check all events in all terms
     *
     * @private
     */
    var checkAllEvents = function() {
        // Tick all boxes
        $('.gh-select-all').prop('checked', 'checked');
        // Fire the change event to let the handlers do their magic
        $('.gh-select-all').change();
    };

    /**
     * Check/uncheck all events in a term
     *
     * @private
     */
    var toggleAllEventsInTerm = function() {
        // Determine if the boxes should all be checked
        var checkAll = $(this).is(':checked');
        // Get the boxes to check
        var $checkboxes = $($(this).closest('thead').next('tbody').find('input[type="checkbox"]'));
        // (un)check the boxes
        if (checkAll) {
            $checkboxes.prop('checked', 'checked');
        } else {
            $checkboxes.removeAttr('checked');
        }
        // Trigger the change event on all checkboxes
        $checkboxes.change();
    };

    /**
     * Checks/unchecks a single event
     *
     * @private
     */
    var toggleEvent = function() {
        if ($(this).is(':checked')) {
            $(this).closest('tr').addClass('info');
        } else {
            $(this).closest('tr').removeClass('info');
        }
    };

    /**
     * Shows/hides the batch edit footer based on whether or not updates happened
     *
     * @private
     */
    var toggleSubmit = function() {
        var eventsUpdated = $('.gh-batch-edit-events-container tbody tr.active').length;
        if (eventsUpdated) {
            // Update the count
            var countString = eventsUpdated + ' event' + (eventsUpdated === 1 ? '' : 's' ) + ' updated';
            $('.gh-batch-edit-actions-container #gh-batch-edit-change-summary').text(countString);
            // Show the save button if events have changed but not submitted
            $('.gh-batch-edit-actions-container').removeClass('hide');
        } else {
            // Hide the save button if all events have been submitted
            $('.gh-batch-edit-actions-container').addClass('hide');
        }
    };

    /**
     * Handles keypress events when focus is set to individual edit fields
     *     - Initialises jEditable field when hitting space or enter
     *
     * @param  {Event}    ev    Standard jQuery keypress event
     * @private
     */
    var handleEditableKeyPress = function(ev) {
        var key = parseInt(ev.which, 10);
        if (key === 32 || key === 13) {
            $(this).click();
        }
    };


    ////////////////
    // BATCH EDIT //
    ////////////////

    /**
     * Verifies that a valid value was entered and persists the value in the field
     *
     * @param  {String}   value     The new value for the item
     * @return {String}             The value to show in the editable field after editing completed
     * @private
     */
    var editableSubmitted = function(value, editableField) {
        // Get the value
        value = $.trim(value);
        // If no value has been entered, we fall back to the previous value
        if (!value) {
            return this.revert;
        } else {
            // Depending on what editable field we're submitting either save it straight away or show a different save button
            var isSeriesTitleEdit = editableField.cssclass.match('gh-jeditable-form-with-submit');
            isSeriesTitleEdit =  isSeriesTitleEdit && isSeriesTitleEdit.length;

            // If the series title has been edited and submitted, persist the values straight away
            if (isSeriesTitleEdit) {
                if (this.revert !== value) {
                    var seriesId = parseInt($.bbq.getState()['series'], 10);
                    seriesAPI.updateSeries(seriesId, value, null, null, function(err, data) {
                        if (err) {
                            // Show a failure notification
                            return utilAPI.notification('Series title not updated.', 'The series title could not be successfully updated.', 'error');
                        }

                        // Update the series in the sidebar
                        $('#gh-modules-list .list-group-item[data-id="' + seriesId + '"] .gh-list-description p').text(value);

                        // Show a success notification
                        return utilAPI.notification('Series title updated.', 'The series title was successfully updated.');
                    });
                }
            // If the events have been edited and submitted, toggle the sticky footer save button
            } else {
                // If there was a change, mark the row so it's visually obvious that an edit was made to it
                if (this.revert !== value) {
                    $('.gh-batch-edit-events-container tbody tr[data-eventid="' + $(this).closest('tr').data('eventid') + '"]').removeClass('danger active success').addClass('active');
                    // Show the save button
                    toggleSubmit();
                }
            }
            return value;
        }
    };

    /**
     * Set up editable fields in the batch edit tables
     *
     * @private
     */
    var setUpJEditable = function() {
        // Apply jEditable for inline editing of events
        $('.gh-jeditable-events').editable(editableSubmitted, {
            'cssclass' : 'gh-jeditable-form',
            'height': '38px',
            'onblur': 'submit',
            'placeholder': '',
            'select' : true,
            'tooltip': 'Click to edit',
            'callback': function(value, settings) {
                // Focus the edited field td element after submitting the value
                // for improved keyboard accessibility
                if (!$(':focus', $('.gh-batch-edit-events-container')).length) {
                    $(this).focus();
                }
            }
        });

        // Apply jEditable to the series title
        $('.gh-jeditable-series-title').editable(editableSubmitted, {
            'cssclass' : 'gh-jeditable-form gh-jeditable-form-with-submit',
            'height': '38px',
            'maxlength': 255,
            'onblur': 'submit',
            'placeholder': '',
            'select' : true,
            'submit': '<button type="submit" class="btn btn-default">Save</button>',
            'tooltip': 'Click to edit'
        });
    };

    /**
     * Submit all changes made in batch edit mode
     *
     * @private
     */
    var submitBatchEdit = function() {
        var eventObjs = [];

        // For each term, go over each event and create an event object to persist
        // TODO: Only persist the events that have changed
        _.each($('.gh-batch-edit-events-container'), function($termContainer) {
            // Loop over each event in the term and create the event object
            _.each($('tbody tr.active', $termContainer), function($eventContainer) {
                $eventContainer = $($eventContainer);
                var eventObj = {
                    'id': $eventContainer.data('eventid'),
                    // 'description': '',
                    'displayName': $('.gh-event-description', $eventContainer).text(),
                    // 'end': '',
                    'location': $('.gh-event-location', $eventContainer).text(),
                    // 'group': '',
                    'notes': $('.gh-event-type', $eventContainer).text(),
                    'organisers': $('.gh-event-organisers', $eventContainer).text(),
                    // 'start': ''
                };
                eventObjs.push(eventObj);
            });
        });

        var done = 0;
        var todo = eventObjs.length;
        var hasError = false;

        /**
         * Update a single event. Calls itself when more events need updating and executes
         * a callback function when everything has been persisted
         *
         * @param  {Object}      updatedEvent    The event that needs to be updated
         * @param  {Function}    callback        Standard callback function
         * @private
         */
        var submitEventUpdate = function(updatedEvent, callback) {
            eventAPI.updateEvent(updatedEvent.id, updatedEvent.displayName, null, null, null, null, updatedEvent.location, updatedEvent.notes, function(evErr, data) {
                if (evErr) {
                    hasError = true;
                }

                // Create an object of the organisers
                // TODO: Implement lookup to handle organisers properly
                // The current implementation in the UI doesn't allow for the removal of organisers but it wouldn't 
                // make sense to implement this, waiting for lookup to be hooked in
                var organisers = _.object([updatedEvent.organisers], [true]);
                // Update the event organisers
                eventAPI.updateEventOrganisers(updatedEvent.id, organisers, function(orgErr, data) {
                    if (orgErr) {
                        hasError = true;
                        // Mark the row so it's visually obvious that the update failed
                        $('.gh-batch-edit-events-container tbody tr[data-eventid="' + updatedEvent.id + '"]').addClass('danger');
                    } else {
                        // Mark the row so it's visually obvious that the update was successful
                        $('.gh-batch-edit-events-container tbody tr[data-eventid="' + updatedEvent.id + '"]').removeClass('danger active').addClass('success');
                    }

                    // If we're done, execute the callback, otherwise call the function again with
                    // the next event to update
                    done++;
                    if (done === todo) {
                        callback();
                    } else {
                        submitEventUpdate(eventObjs[done], callback);
                    }
                });
            });
        };

        // Persist the first update
        if (eventObjs.length) {
            // Deselect the 'check all' checkbox to see progress update
            $('.gh-select-all').prop('checked', false);
            $('.gh-select-all').change();
            // Start by submitting the first update
            submitEventUpdate(eventObjs[done], function() {
                if (hasError) {
                    return utilAPI.notification('Events not updated.', 'Not all events could be successfully updated.', 'error');
                }
                // Hide the save button
                toggleSubmit();
                return utilAPI.notification('Events updated.', 'The events where successfully updated.');
            });
        }
    };

    /**
     * Batch edit the event type
     *
     * @private
     */
    var batchEditType = function() {
        // Get the title
        var title = $(this).val();
        // Update all rows that are checked
        $('.gh-batch-edit-events-container tbody tr.info .gh-event-type').text(title);
        // Add an `active` class to all updated rows to indicate that changes where made
        $('.gh-batch-edit-events-container tbody tr.info').addClass('active');
        // Show the save button
        toggleSubmit();
    };

    /**
     * Batch edit the event location
     *
     * @private
     */
    var batchEditLocation = function() {
        // Get the title
        var title = $(this).val();
        // Update all rows that are checked
        $('.gh-batch-edit-events-container tbody tr.info .gh-event-location').text(title);
        // Add an `active` class to all updated rows to indicate that changes where made
        $('.gh-batch-edit-events-container tbody tr.info').addClass('active');
        // Show the save button
        toggleSubmit();
    };

    /**
     * Batch edit the event title
     *
     * @private
     */
    var batchEditTitle = function() {
        // Get the title
        var title = $(this).val();
        // Update all rows that are checked
        $('.gh-batch-edit-events-container tbody tr.info .gh-event-description').text(title);
        // Add an `active` class to all updated rows to indicate that changes where made
        $('.gh-batch-edit-events-container tbody tr.info').addClass('active');
        // Show the save button
        toggleSubmit();
    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    /**
     * Load the information on the series and events in the series before initialising
     * the batch edit page
     *
     * @private
     */
    var loadSeriesEvents = function() {
        var seriesId = parseInt($.bbq.getState()['series'], 10);

        // Get the information about the series
        seriesAPI.getSeries(seriesId, function(err, series) {
            if (err) {
                return gh.api.utilAPI.notification('Series not retrieved.', 'The event series could not be successfully retrieved.', 'error');
            }

            // Get the information about the events in the series
            seriesAPI.getSeriesEvents(seriesId, 100, 0, false, function(err, events) {
                if (err) {
                    return gh.api.utilAPI.notification('Events not retrieved.', 'The events could not be successfully retrieved.', 'error');
                }

                // Load up the batch edit page and provide the events and series data
                $(document).trigger('gh.admin.changeView', {
                    'name': adminConstants.views.BATCH_EDIT,
                    'data': {
                        'events': events,
                        'series': series
                    }
                });
            });
        });
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the listview
     *
     * @private
     */
    var addBinding = function() {
        // Setup
        $(document).on('gh.batchedit.setup', loadSeriesEvents);
        $(document).on('gh.batchedit.rendered', setUpJEditable);

        // Settings
        $('body').on('click', '.gh-select-all-terms', checkAllEvents);
        $('body').on('click', '.gh-rename-series', renameSeries);

        // List utilities
        $('body').on('change', '.gh-select-all', toggleAllEventsInTerm);
        $('body').on('change', '.gh-select-single', toggleEvent);

        // Batch edit form submission
        $('body').on('click', '#gh-batch-edit-submit', submitBatchEdit);

        // Batch edit header functionality
        $('body').on('keyup', '#gh-batch-edit-title', batchEditTitle);
        $('body').on('keyup', '#gh-batch-edit-location', batchEditLocation);
        $('body').on('keyup', '#gh-batch-edit-type', batchEditType);

        // Keyboard accessibility
        $('body').on('keypress', 'td.gh-jeditable-events', handleEditableKeyPress);
    };

    addBinding();
});
