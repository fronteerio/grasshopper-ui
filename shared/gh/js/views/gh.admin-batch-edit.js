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

define(['gh.constants', 'gh.api.event', 'gh.api.groups', 'gh.api.series', 'gh.api.util', 'moment', 'gh.admin-event-type-select', 'gh.datepicker', 'gh.admin-batch-edit-date'], function(constants, eventAPI, groupAPI, seriesAPI, utilAPI, moment) {


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
     * Add a new event row to the table and initialise the editable fields in it
     *
     * @private
     */
    var addNewEventRow = function(ev, data) {
        var $eventContainer = data && data.eventContainer ? $(data.eventContainer) : $(this).closest('thead').next('tbody');
        var termName = $eventContainer.closest('.gh-batch-edit-events-container').data('term');
        var termStart = utilAPI.getFirstDayOfTerm(termName);
        var eventObj = {'ev': null};
        eventObj.ev = data && data.eventObj ? data.eventObj : {
            'tempId': utilAPI.generateRandomString(), // The actual ID hasn't been generated yet
            'isNew': true, // Used in the template to know this one needs special handling
            'displayName': $('.gh-jeditable-series-title').text(),
            'end': moment(moment([termStart.getFullYear(), termStart.getMonth(), termStart.getDate(), 14, 0, 0, 0])).utc().format(),
            'location': '',
            'notes': 'Lecture',
            'organisers': 'organiser',
            'start': moment(moment([termStart.getFullYear(), termStart.getMonth(), termStart.getDate(), 13, 0, 0, 0])).utc().format()
        };
        eventObj['utilAPI'] = utilAPI;

        // Append a new event row
        $eventContainer.append(utilAPI.renderTemplate($('#gh-batch-edit-event-row-template'), eventObj));
        // Enable JEditable on the row
        setUpJEditable();
        // Show the save button
        toggleSubmit();
    };

    /**
     * Delete an event from the series
     *
     * @private
     */
    var deleteEvent = function() {
        // Only soft delete the event when it hasn't been created in the first place. If the
        // row has no 'eventid' data attribute it shouldn't be deleted from the db
        var $row = $(this).closest('tr');
        if ($row.data('eventid')) {
            $row.addClass('gh-event-deleted').fadeOut(200);
            toggleSubmit();
        } else {
            $row.addClass('gh-event-deleted').fadeOut(200, function() {
                $row.remove();
            });
        }
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
        toggleBatchEditDateEnabled();
    };

    /**
     * Shows/hides the batch edit footer based on whether or not updates happened
     *
     * @private
     */
    var toggleSubmit = function() {
        var eventsUpdated = $('.gh-batch-edit-events-container tbody tr.active:not(.gh-event-deleted)').length + $('.gh-batch-edit-events-container tbody tr.gh-event-deleted').length;

        if (eventsUpdated) {
            // Update the count
            var updatedCountString = eventsUpdated + ' event' + (eventsUpdated === 1 ? '' : 's' ) + ' updated';
            $('.gh-batch-edit-actions-container #gh-batch-edit-change-summary').text(updatedCountString);
            // Show the save button if events have changed but not submitted
            $('.gh-batch-edit-actions-container').fadeIn(200);
        } else {
            // Hide the save button if all events have been submitted
            $('.gh-batch-edit-actions-container').fadeOut(200);
        }
    };

    /**
     * Enable or disable batch editing of dates depending on whether or not there are
     * event rows that have been selected
     *
     * @private
     */
    var toggleBatchEditDateEnabled = function() {
        if ($('.gh-batch-edit-events-container tbody .gh-select-single:checked').length) {
            $('#gh-batch-edit-time').removeAttr('disabled');
        } else {
            $('#gh-batch-edit-header').removeClass('gh-batch-edit-time-open');
            $('#gh-batch-edit-time').attr('disabled', 'disabled');
        }
    };

    /**
     * Show/hide the date batch editing functionality
     *
     * @private
     */
    var toggleBatchEditDate = function() {
        $('#gh-batch-edit-header').toggleClass('gh-batch-edit-time-open');
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

    /**
     * Make the header stick to the top of the page, depending on how far
     * down the page is scrolled
     *
     * @private
     */
    var handleStickyHeader = function() {
        // Only attempt to handle scrolling when the batch edit is being used
        if ($('#gh-batch-edit-view').is(':visible')) {
            // Get the top of the window and the top of the header's position
            var windowTop = $(window).scrollTop();
            var headerTop = $('#gh-sticky-header-anchor').offset().top;
            // If the window is scrolled further down than the header was originally
            // positioned, make the header sticky
            if (windowTop >= headerTop) {
                $('#gh-batch-edit-container').addClass('gh-sticky-header');
                // Set the margin of the batch edit container to the height of the sticky header
                $('#gh-batch-edit-term-container').css('margin-top', $('#gh-batch-edit-container').outerHeight() + 'px');
            } else {
                $('#gh-batch-edit-container').removeClass('gh-sticky-header');
                // Reset the margin of the batch edit container
                $('#gh-batch-edit-term-container').css('margin-top', 0);
            }
        }
    };


    /////////////
    // LOCKING //
    /////////////

    // The interval at which to lock the group
    var lockInterval = null;
    // The ID of the group that's currently being locked
    var lockedGroupId = null;

    /**
     * Lock the group
     *
     * @private
     */
    var lockGroup = function() {
        // Get the GroupId
        lockedGroupId = $('#gh-modules-container button[data-groupid]').data('groupid');
        // Lock the group
        groupAPI.lock(lockedGroupId);
        // Lock the currently edited group every 60 seconds
        lockInterval = setInterval(function() {
            // Only attempt to lock when the batch edit mode is active
            if ($('#gh-batch-edit-view').is(':visible')) {
                groupAPI.lock(lockedGroupId);
            // If batch edit is not active we can unlock the group
            } else {
                unlockGroup();
            }
        }, 60000);
    };

    /**
     * Unlock the group
     *
     * @private
     */
    var unlockGroup = function() {
        // Only unlock the group if it was previously locked
        if (lockedGroupId) {
            // Unlock the group
            groupAPI.unlock(lockedGroupId);
            // Clear the interval
            clearInterval(lockInterval);
        }
    };


    ////////////////
    // BATCH EDIT //
    ////////////////

    /**
     * Verify that a valid series title was entered and saves the value
     *
     * @param  {String}   value     The new value for the item
     * @return {String}             The value to show in the editable field after editing completed
     * @private
     */
    var editableSeriesTitleSubmitted = function(value, editableField) {
        // Get the value
        value = $.trim(value);
        // If no value has been entered, we fall back to the previous value
        if (!value) {
            return this.revert;
        } else if (this.revert !== value) {
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
        return value;
    };

    /**
     * Verify that a valid value was entered and persist the value in the field
     *
     * @param  {String}   value     The new value for the item
     * @return {String}             The value to show in the editable field after editing completed
     * @private
     */
    var editableEventSubmitted = function(value, editableField) {
        // Get the value
        value = $.trim(value);
        // Get the event ID. If no eventId is found on the tr that means we're dealing with a newly added event
        var eventId = $(this).closest('tr').data('eventid');
        // If no value has been entered, we fall back to the previous value
        if (!value) {
            return this.revert;
        // A value has been entered and the event already existed
        } else if (this.revert !== value && eventId) {
            $('.gh-batch-edit-events-container tbody tr[data-eventid="' + eventId + '"]').removeClass('danger active success').addClass('active');
            // Show the save button
            toggleSubmit();
        // A value has been entered and this is a newly added event
        } else if (this.revert !== value && !eventId) {
            $(this).closest('tr').removeClass('danger active success').addClass('active gh-new-event-row');
            // Show the save button
            toggleSubmit();
        }
        // Return the selected value
        return value;
    };

    /**
     * Verify that a valid value for event type was entered and persist the value in the field
     *
     * @param  {String}   value     The new value for the item
     * @return {String}             The value to show in the editable field after editing completed
     * @private
     */
    var editableEventTypeSubmitted = function(value, editableField) {
        // Get the value
        value = $.trim(value);
        // Get the event ID. If no eventId is found on the tr that means we're dealing with a newly added event
        var eventId = $(this).closest('tr').data('eventid');
        // If no value has been entered, we fall back to the previous value
        if (!value) {
            return this.revert;
        // A value has been entered and the event already existed
        } else if (this.revert !== value && eventId) {
            $('.gh-batch-edit-events-container tbody tr[data-eventid="' + eventId + '"]').removeClass('danger active success').addClass('active');
            // Show the save button
            toggleSubmit();
        // A value has been entered and this is a newly added event
        } else if (this.revert !== value && !eventId) {
            $(this).closest('tr').removeClass('danger active success').addClass('active gh-new-event-row');
            // Show the save button
            toggleSubmit();
        }
        // Remove the editing class from the table cell
        $(this).removeClass('gh-editing');
        // Return the selected value
        return value;
    };

    /**
     * Set up editable fields in the batch edit tables
     *
     * @private
     */
    var setUpJEditable = function() {

        // Apply jEditable to the series title
        $('.gh-jeditable-series-title').editable(editableSeriesTitleSubmitted, {
            'cssclass' : 'gh-jeditable-form gh-jeditable-form-with-submit',
            'height': '38px',
            'maxlength': 255,
            'onblur': 'submit',
            'placeholder': '',
            'select' : true,
            'submit': '<button type="submit" class="btn btn-default">Save</button>'
        });

        // Apply jEditable for inline editing of event rows
        $('.gh-jeditable-events').editable(editableEventSubmitted, {
            'cssclass' : 'gh-jeditable-form',
            'height': '38px',
            'onblur': 'submit',
            'placeholder': '',
            'select' : true,
            'callback': function(value, settings) {
                // Focus the edited field td element after submitting the value
                // for improved keyboard accessibility
                if (!$(':focus', $('.gh-batch-edit-events-container')).length) {
                    $(this).focus();
                }
            }
        });

        // Apply jEditable to the event notes
        $('.gh-jeditable-events-select').editable(editableEventTypeSubmitted, {
            'cssclass' : 'gh-jeditable-form',
            'placeholder': '',
            'select': true,
            'tooltip': 'Click to edit event notes',
            'type': 'event-type-select',
            'callback': function(value, settings) {
                // Focus the edited field td element after submitting the value
                // for improved keyboard accessibility
                if (!$(':focus', $('.gh-batch-edit-events-container')).length) {
                    $(this).focus();
                }
            }
        });
    };

    /**
     * Update all events that were edited or created
     *
     * @param  {Event[]}     updatedEventObjs    Array of event objects to submit updates for
     * @param  {Function}    callback            Standard callback function
     * @param  {Error}       callback.err        Error object containing the error code and error message
     * @private
     */
    var submitEventUpdates = function(updatedEventObjs, callback) {
        if (!updatedEventObjs.length) {
            return callback(null);
        }

        var done = 0;
        var todo = updatedEventObjs.length;
        var hasError = false;

        /**
         * Update a single event. Calls itself when more events need updating and executes
         * a callback function when everything has been persisted
         *
         * @param  {Object}      updatedEvent    The event that needs to be updated
         * @param  {Function}    callback        Standard callback function
         * @private
         */
        var submitEventUpdate = function(updatedEvent, _callback) {
            eventAPI.updateEvent(updatedEvent.id, updatedEvent.displayName, null, null, updatedEvent.start, updatedEvent.end, updatedEvent.location, updatedEvent.notes, function(evErr, data) {
                if (evErr) {
                    hasError = true;
                }

                if (updatedEvent.organisers) {
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
                            _callback();
                        } else {
                            submitEventUpdate(updatedEventObjs[done], _callback);
                        }
                    });
                } else {
                        if (evErr) {
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
                            _callback();
                        } else {
                            submitEventUpdate(updatedEventObjs[done], _callback);
                        }
                }
            });
        };

        // Start by submitting the first update
        submitEventUpdate(updatedEventObjs[done], function() {
            callback(hasError);
        });
    };

    /**
     * Create all new events that were added
     *
     * @param  {Event[]}     newEventObjs    Array of new events to create in the series
     * @param  {Function}    callback        Standard callback function
     * @param  {Error}       callback.err    Error object containing the error code and error message
     * @private
     */
    var createNewEvents = function(newEventObjs, callback) {
        if (!newEventObjs.length) {
            return callback(null);
        }

        var done = 0;
        var todo = newEventObjs.length;
        var hasError = false;

        /**
         * Create a single event. Calls itself when more events need to be created and executes
         * a callback function when everything has been persisted
         *
         * @param  {Object}      newEvent    The bew event that needs to be created
         * @param  {Function}    callback    Standard callback function
         * @private
         */
        var createNewEvent = function(newEvent, _callback) {
            // Get the ID of the series this event is added to
            var seriesId = parseInt($.bbq.getState()['series'], 10);
            eventAPI.createEvent(newEvent.displayName, newEvent.start, newEvent.end, null, null, newEvent.location, newEvent.notes, newEvent.organisers, null, seriesId, function(evErr, data) {
                if (evErr) {
                    hasError = true;
                    // Mark the row so it's visually obvious that the creation failed
                    $('.gh-batch-edit-events-container tbody tr[data-tempid="' + newEvent.tempId + '"]').addClass('danger');
                } else {
                    var $row = $('.gh-batch-edit-events-container tbody tr[data-tempid="' + newEvent.tempId + '"]');
                    // Mark the row so it's visually obvious that the creation was successful
                    $row.removeClass('danger active').addClass('success');
                    // Replace the temporary ID with the real one
                    $row.data('tempid', null).removeAttr('data-tempid');
                    $row.data('eventid', data.id).attr('data-eventid', data.id).removeClass('gh-new-event-row');
                }

                // If we're done, execute the callback, otherwise call the function again with
                // the next event to create
                done++;
                if (done === todo) {
                    _callback();
                } else {
                    createNewEvent(newEventObjs[done], _callback);
                }
            });
        };

        // Start by submitting the first new event
        createNewEvent(newEventObjs[done], function() {
            callback(hasError);
        });
    };

    /**
     * Delete events
     *
     * @param  {Event[]}     eventsToDelete    Array of events to delete
     * @param  {Function}    callback          Standard callback function
     * @param  {Error}       callback.err      Error object containing the error code and error message
     * @private
     */
    var deleteEvents = function(eventsToDelete, callback) {
        if (!eventsToDelete.length) {
            return callback(null);
        }

        var done = 0;
        var todo = eventsToDelete.length;
        var hasError = false;

        /**
         * Delete an event
         *
         * @param  {String}      eventID   The ID of the event to delete
         * @param  {Function}    _callback Standard callback function
         * @private
         */
        var deleteEvent = function(eventID, _callback) {
            eventAPI.deleteEvent(eventID, function(err) {
                // Remove the row from the DOM
                $('.gh-batch-edit-events-container tbody tr[data-eventid="' + eventID + '"]').remove();

                // If we're done, execute the callback, otherwise call the function again with
                // the next event to delete
                done++;
                if (done === todo) {
                    _callback();
                } else {
                    deleteEvent(eventsToDelete[done], _callback);
                }
            });
        };

        // Start by deleting the first event
        deleteEvent(eventsToDelete[done], function() {
            callback(hasError);
        });
    };

    /**
     * Submit all changes made in batch edit mode
     *
     * @private
     */
    var submitBatchEdit = function() {
        var updatedEventObjs = [];
        var newEventObjs = [];
        var eventsToDelete = [];

        // For each term, go over each event and create an event object to persist
        // TODO: Only persist the events that have changed
        _.each($('.gh-batch-edit-events-container'), function($termContainer) {
            // Loop over each (non-new) event in the term and create the event object
            _.each($('tbody tr.active:not(.gh-new-event-row)', $termContainer), function($eventContainer) {
                $eventContainer = $($eventContainer);
                var updatedEventObj = {
                    'id': $eventContainer.data('eventid'),
                    // 'description': '',
                    'displayName': $('.gh-event-description', $eventContainer).text(),
                    'end': $('.gh-event-date', $eventContainer).attr('data-end'),
                    'location': $('.gh-event-location', $eventContainer).text(),
                    // 'group': '',
                    'notes': $('.gh-event-type', $eventContainer).attr('data-type'),
                    'organisers': $('.gh-event-organisers', $eventContainer).text() || null,
                    'start': $('.gh-event-date', $eventContainer).attr('data-start')
                };
                updatedEventObjs.push(updatedEventObj);
            });

            // Loop over each new event in the term and create the event object
            _.each($('tbody tr.active.gh-new-event-row', $termContainer), function($eventContainer) {
                $eventContainer = $($eventContainer);
                var newEventObj = {
                    'tempId': $eventContainer.data('tempid'),
                    // 'description': '',
                    'displayName': $('.gh-event-description', $eventContainer).text(),
                    'end': $('.gh-event-date', $eventContainer).attr('data-end'),
                    'location': $('.gh-event-location', $eventContainer).text(),
                    // 'group': '',
                    'notes': $('.gh-event-type', $eventContainer).attr('data-type'),
                    'organisers': $('.gh-event-organisers', $eventContainer).text() || null,
                    'start': $('.gh-event-date', $eventContainer).attr('data-start')
                };
                newEventObjs.push(newEventObj);
            });

            // Loop over each deleted event in the term and create the event object
            _.each($('tbody tr.gh-event-deleted', $termContainer), function($eventContainer) {
                $eventContainer = $($eventContainer);
                // Only push it in the array if it has an event ID
                var eventID = $eventContainer.data('eventid');
                if (eventID) {
                    eventsToDelete.push(eventID);
                }
            });
        });

        // Deselect the 'check all' checkbox to see progress update
        $('.gh-select-all').prop('checked', false);
        $('.gh-select-all').change();
        // Submit the event updates
        submitEventUpdates(updatedEventObjs, function(updateErr) {
            // Create the new events
            createNewEvents(newEventObjs, function(newErr) {
                // Delete events
                deleteEvents(eventsToDelete, function(deleteErr) {
                    if (updateErr || newErr || deleteErr) {
                        return utilAPI.notification('Events not updated.', 'Not all events could be successfully updated.', 'error');
                    }
                    // Hide the save button
                    toggleSubmit();
                    return utilAPI.notification('Events updated.', 'The events where successfully updated.');
                });
            });
        });
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
        $('.gh-batch-edit-events-container tbody tr.info .gh-event-type').text(title).attr('data-type', title).attr('data-first', title.substr(0,1));
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

    /**
     * Batch edit the event date
     *
     * @param  {Event}     ev         Standard jQuery event
     * @param  {Object}    trigger    jQuery object representing the trigger
     * @private
     */
    var batchEditDate = function(ev, trigger) {
        var eventId = $(trigger).closest('tr').data('eventid');
        if (!eventId) {
            // Add an `active` class to the updated row to indicate that changes where made and
            // add a 'gh-new-event-row' class to it to indicate it's a new event
            $(trigger).parent().addClass('active gh-new-event-row');
        } else {
            // Add an `active` class to the updated row to indicate that changes where made
            $(trigger).parent().addClass('active');
        }
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

                // Unlock the currently locked group
                unlockGroup();

                // Load up the batch edit page and provide the events and series data
                $(document).trigger('gh.admin.changeView', {
                    'name': constants.views.BATCH_EDIT,
                    'data': {
                        'events': events,
                        'series': series
                    }
                });

                // Lock the currently edited group every 60 seconds
                lockGroup();

                // TODO: Remove this and only trigger when button is clicked/expanded
                $(document).trigger('gh.batchdate.setup');
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
        $(window).scroll(handleStickyHeader);

        // External edit
        $(document).on('gh.datepicker.change', batchEditDate);
        $('body').on('click', '.gh-event-date', function() {
            $(document).trigger('gh.datepicker.show', this);
        });

        // Settings
        $('body').on('click', '.gh-select-all-terms', checkAllEvents);
        $('body').on('click', '.gh-rename-series', renameSeries);

        // List utilities
        $('body').on('change', '.gh-select-all', toggleAllEventsInTerm);
        $('body').on('change', '.gh-select-single', toggleEvent);
        $('body').on('click', '.gh-new-event', addNewEventRow);
        $(document).on('gh.batchedit.addevent', addNewEventRow);
        $('body').on('click', '.gh-event-delete', deleteEvent);

        // Batch edit form submission and cancel
        $('body').on('click', '#gh-batch-edit-submit', submitBatchEdit);
        $('body').on('click', '#gh-batch-edit-cancel', loadSeriesEvents);

        // Batch edit header functionality
        $('body').on('keyup', '#gh-batch-edit-title', batchEditTitle);
        $('body').on('keyup', '#gh-batch-edit-location', batchEditLocation);
        $('body').on('change', '#gh-batch-edit-type', batchEditType);
        $('body').on('click', '#gh-batch-edit-time', toggleBatchEditDate);

        // Keyboard accessibility
        $('body').on('keypress', 'td.gh-jeditable-events', handleEditableKeyPress);
        $('body').on('keypress', 'td.gh-jeditable-events-select', handleEditableKeyPress);
    };

    addBinding();
});
