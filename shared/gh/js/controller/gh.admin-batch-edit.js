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

    /**
     * Check/uncheck all events in a term
     *
     * @private
     */
    var toggleAllEvents = function() {
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
     * Verifies that a valid value was entered and persists the value in the field
     *
     * @param  {String}   value     The new value for the item
     * @return {String}             The value to show in the editable field after editing completed
     * @private
     */
    var editableSubmitted = function(value) {
        // Get the value
        value = $.trim(value);
        // If no value has been entered, we fall back to the previous value
        if (!value) {
            return this.revert;
        } else {
            // Mark the row so it's visually obvious that an edit was made to it
            $('.gh-batch-edit-events-container tbody tr[data-eventid="' + $(this).closest('tr').data('eventid') + '"]').removeClass('danger active success').addClass('active');
            return value;
        }
    };

    /**
     * Set up editable fields in the batch edit tables
     *
     * @private
     */
    var setUpJEditable = function() {
        // Apply jEditable for inline editing
        $('.jeditable-field').editable(editableSubmitted, {
            'onblur': 'submit',
            'select' : true
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
                    'notes': $('.gh-event-notes', $eventContainer).text(),
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
            eventAPI.updateEvent(updatedEvent.id, updatedEvent.displayName, null, null, null, null, updatedEvent.location, updatedEvent.notes, function(err, data) {
                if (err) {
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
        };

        // Persist the first update
        if (eventObjs.length) {
            submitEventUpdate(eventObjs[done], function() {
                if (hasError) {
                    return utilAPI.notification('Events not edited.', 'Not all events could be successfully edited.', 'error');
                }
                return utilAPI.notification('Events edited.', 'The events where successfully edited.');
            });
        }
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
        $(document).on('gh.batchedit.setup', loadSeriesEvents);
        $(document).on('gh.batchedit.rendered', setUpJEditable);

        $('body').on('change', '.gh-select-all', toggleAllEvents);
        $('body').on('change', '.gh-select-single', toggleEvent);
        $('body').on('click', '#gh-batch-edit-submit', submitBatchEdit);
    };

    addBinding();
});
