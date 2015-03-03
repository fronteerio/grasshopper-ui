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

define(['gh.core', 'gh.constants', 'gh.utils', 'moment', 'gh.calendar', 'gh.admin-event-type-select', 'gh.datepicker', 'gh.admin-batch-edit-date', 'gh.admin-batch-edit-organiser', 'gh.admin-edit-organiser', 'gh.delete-series'], function(gh, constants, utils, moment) {

    // Object used to cache the triposData
    var triposData = null;


    ///////////////
    // UTILITIES //
    ///////////////

    /**
     * Fade the colourisation of a row over 2 seconds and remove the `gh-fade` class
     * after the animation completes
     *
     * @param  {Object|String}    $row    jQuery object or selector of the row to fade
     * @private
     */
    var fadeRowColour = function($row) {
        // Make sure we're dealing with a jQuery object
        $row = $($row);
        // Set a timeout of 2 seconds before fading out the row colour
        setTimeout(function() {
            $row.addClass('gh-fade');
            // Set a timeout of 2 seconds before removing the `gh-fade` animation class
            setTimeout(function() {
                $row.removeClass('danger active success gh-fade');
            }, 2000);
        }, 2000);
    };

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
        var termStart = utils.getFirstDayOfTerm(termName);
        var eventObj = {'ev': null};
        eventObj.ev = data && data.eventObj ? data.eventObj : {
            'displayName': $('.gh-jeditable-series-title').text(),
            'end': moment(moment([termStart.getFullYear(), termStart.getMonth(), termStart.getDate(), 14, 0, 0, 0])).utc().format(),
            'isNew': true, // Used in the template to know this one needs special handling
            'location': '',
            'notes': 'Lecture',
            'organisers': [],
            'selected': true,
            'start': moment(moment([termStart.getFullYear(), termStart.getMonth(), termStart.getDate(), 13, 0, 0, 0])).utc().format(),
            'tempId': utils.generateRandomString() // The actual ID hasn't been generated yet
        };
        eventObj['utils'] = utils;

        // Append a new event row
        $eventContainer.append(utils.renderTemplate($('#gh-batch-edit-event-row-template'), eventObj));
        // Enable JEditable on the row
        setUpJEditable();
        // Show the save button
        toggleSubmit();
        // Enable batch editing of dates
        toggleBatchEditDateEnabled();
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
        // Let other components know that an event was deleted
        $(document).trigger('gh.event.deleted');
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
     * Toggles each and every action in the UI to be disabled or enabled based on
     * the parameter passed in to the function
     *
     * @param  {Boolean}    [disable]    Whether or not to disable all elements. Defaults to `false`
     * @private
     */
    var disableEnableAll = function(disable) {
        disable = disable || false;

        // Disable input elements and fire off an event for Chosen to be able to adjust itself
        $('button, input, select, textarea').attr('disabled', disable).trigger('chosen:updated.chosen');

        if (disable) {
            // Disable jEditable fields
            $('.gh-jeditable-series-title, .gh-jeditable-events, .gh-event-organisers, .gh-event-type').editable('disable');

            // Disable the date picker. This one is not a jEditable field so needs special handling
            $('.gh-event-date').addClass('gh-disabled');
        } else {
            // Enable jEditable fields
            $('.gh-jeditable-series-title, .gh-jeditable-events, .gh-event-organisers, .gh-event-type').editable('enable');

            // Enable the date picker. This one is not a jEditable field so needs special handling
            $('.gh-event-date').removeClass('gh-disabled');
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
                // Set the margin of the batch edit container to the height of the sticky header + original margin-top of the event container
                $('#gh-batch-edit-term-container').css('margin-top', ($('#gh-batch-edit-container').outerHeight() + 60) + 'px');
                // Add the sticky class to the header
                $('#gh-batch-edit-container').addClass('gh-sticky-header');
            } else {
                // Reset the margin of the batch edit container
                $('#gh-batch-edit-term-container').css('margin-top', 0);
                // Remove the sticky class from the header
                $('#gh-batch-edit-container').removeClass('gh-sticky-header');
            }
        }
    };


    //////////////
    // CALENDAR //
    //////////////

    /**
     * Fetch the tripos data that the calendar needs
     *
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var setUpPreviewCalendar = function(callback) {
        // Fetch the triposes
        if (!triposData) {
            utils.getTriposStructure(function(err, data) {
                if (err) {
                    return utils.notification('Fetching triposes failed.', 'An error occurred while fetching the triposes.', 'error');
                }

                // Cache the triposData for future use
                triposData = data;

                // Render the calendar
                renderPreviewCalendar();
            });
        } else {
            // Render the calendar
            renderPreviewCalendar();
        }
    };

    /**
     * Render and initialise the calendar
     *
     * @private
     */
    var renderPreviewCalendar = function() {
        // Render the calendar template
        utils.renderTemplate($('#gh-calendar-template'), {
            'data': {
                'gh': gh,
                'view': 'admin'
            }
        }, $('#gh-calendar-view-container'));

        // Initialise the calendar
        $(document).trigger('gh.calendar.init', {
            'triposData': triposData,
            'orgUnitId': $.bbq.getState().module
        });

        // Put the calendar on today's view
        $(document).trigger('gh.calendar.navigateToToday');
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
        gh.api.groupsAPI.lock(lockedGroupId);
        // Lock the currently edited group every 60 seconds
        lockInterval = setInterval(function() {
            // Only attempt to lock when the batch edit mode is active
            if ($('#gh-batch-edit-view').is(':visible')) {
                gh.api.groupsAPI.lock(lockedGroupId);
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
            gh.api.groupsAPI.unlock(lockedGroupId);
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
            gh.api.seriesAPI.updateSeries(seriesId, value, null, null, function(err, data) {
                if (err) {
                    // Show a failure notification
                    return utils.notification('Series title not updated.', 'The series title could not be successfully updated.', 'error');
                }

                // Update the series in the sidebar
                $('#gh-modules-list .list-group-item[data-id="' + seriesId + '"] .gh-list-description p').text(value);

                // Show a success notification
                return utils.notification('Series title updated.', 'The series title was successfully updated.');
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
     * Parse the AutoSuggest input and display a list of organisers
     *
     * @private
     */
    var editableOrganiserSubmitted = function() {
        // Retrieve the values from the AutoSuggest field and create a String to show
        var $hiddenFields = $(this).closest('.gh-event-organisers').prev('.gh-event-organisers-fields').find('input[data-add="true"]');
        var organisers = [];

        // Create the stringified organiser Array
        _.each($hiddenFields, function(hiddenField) {
            organisers.push(hiddenField.value);
        });

        // Mark the row as edited
        $(this).closest('tr').addClass('active');

        // Toggle the submit button
        toggleSubmit();

        // Return the stringified organisers
        return organisers.join(', ');
    };

    /**
     * Set up editable fields in the batch edit tables
     *
     * @private
     */
    var setUpJEditable = function() {

        // Apply jEditable to the series title
        $('.gh-jeditable-series-title').editable(editableSeriesTitleSubmitted, {
            'cssclass': 'gh-jeditable-form gh-jeditable-form-with-submit',
            'height': '38px',
            'maxlength': 255,
            'onblur': 'submit',
            'placeholder': '',
            'select' : true,
            'submit': '<button type="submit" class="btn btn-default">Save</button>'
        });

        // Apply jEditable for inline editing of event rows
        $('.gh-jeditable-events').editable(editableEventSubmitted, {
            'cssclass': 'gh-jeditable-form',
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
            'cssclass': 'gh-jeditable-form',
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

        // Apply jEditable to the organisers
        $('.gh-event-organisers').editable(editableOrganiserSubmitted, {
            'cssclass': 'gh-jeditable-form',
            'placeholder': '',
            'select': true,
            'tooltip': 'Click to edit organisers',
            'type': 'organiser-autosuggest',
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
            gh.api.eventAPI.updateEvent(updatedEvent.id, updatedEvent.displayName, null, null, updatedEvent.start, updatedEvent.end, updatedEvent.location, updatedEvent.notes, function(evErr, data) {
                if (evErr) {
                    hasError = true;
                }

                var $row = $('.gh-batch-edit-events-container tbody tr[data-eventid="' + updatedEvent.id + '"]');

                if (updatedEvent.organisers) {
                    // Update the event organisers
                    gh.api.eventAPI.updateEventOrganisers(updatedEvent.id, updatedEvent.organisers, function(orgErr, data) {
                        if (orgErr) {
                            hasError = true;
                            // Mark the row so it's visually obvious that the update failed
                            $row.addClass('danger');
                        } else {
                            // Mark the row so it's visually obvious that the update was successful
                            $row.removeClass('danger active').addClass('success');
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
                            $row.addClass('danger');
                        } else {
                            // Mark the row so it's visually obvious that the update was successful
                            $row.removeClass('danger active').addClass('success');
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

                // Fade the row colours if there were no errors
                if (!hasError) {
                    fadeRowColour($row);
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
            gh.api.eventAPI.createEvent(newEvent.displayName, newEvent.start, newEvent.end, null, null, newEvent.location, newEvent.notes, newEvent.organiserOther, newEvent.organiserUsers, seriesId, function(evErr, data) {
                var $row = $('.gh-batch-edit-events-container tbody tr[data-tempid="' + newEvent.tempId + '"]');
                if (evErr) {
                    hasError = true;
                    // Mark the row so it's visually obvious that the creation failed
                    $row.addClass('danger');
                } else {
                    // Mark the row so it's visually obvious that the creation was successful
                    $row.removeClass('danger active').addClass('success');
                    // Replace the temporary ID with the real one
                    $row.data('tempid', null).removeAttr('data-tempid');
                    $row.data('eventid', data.id).attr('data-eventid', data.id).removeClass('gh-new-event-row');
                }

                // Fade the row colours if there were no errors
                if (!hasError) {
                    fadeRowColour($row);
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
            gh.api.eventAPI.deleteEvent(eventID, function(err) {
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
     * Get the organisers and their status for an event row (added or removed from the event). Returns null
     * when no organisers where found in the container
     *
     * @param  {jQuery}    $container    jQuery selector of the event row to get organisers for
     * @return {Object}                  Object containing all organisers to add or remove from the event. e.g., {'21': true, 'john doe': false} or `null` when no organisers where found in the container
     * @private
     */
    var getOrganiserState = function($container) {
        var organiserFields = $('.gh-event-organisers-fields input', $container);
        var organisers = {};

        _.each(organiserFields, function($organiserField) {
            $organiserField = $($organiserField);
            var userId = $organiserField.attr('data-id');
            var displayName = $organiserField.val();
            var toAdd = $organiserField.attr('data-add') === "true";

            // If the ID is defined, use that as the key. Otherwise,
            // use the display name as the key
            if (userId) {
                organisers[userId] = toAdd;
            } else {
                organisers[displayName] = toAdd;
            }
        });

        return _.isEmpty(organisers) ? null : organisers;
    };

    /**
     * Get the Array of organiser user IDs (or strings if no existing user was selected) selected
     * in the AutoSuggest field
     *
     * @param  {jQuery}               $container     The container to look for the AutoSuggest field in
     * @return {Number[]|String[]}                   The Array of organiser IDs
     * @private
     */
    var getOrganiserList = function($container) {
        var organiserFields = $('.gh-event-organisers-fields input', $container);
        var organisers = {
            organiserOthers: [],
            organiserUsers: []
        };

        _.each(organiserFields, function($organiserField) {
            $organiserField = $($organiserField);
            var userId = $organiserField.attr('data-id');
            var displayName = $organiserField.val();

            // If the userID is present, push it into the user Array. If no ID
            // is available for the user this user does not have an account and we
            // push the displayName in the others Array
            if (userId) {
                organisers.organiserUsers.push(userId);
            } else {
                organisers.organiserOthers.push(displayName);
            }
        });

        return organisers;
    };

    /**
     * Submit all changes made in batch edit mode
     *
     * @private
     */
    var submitBatchEdit = function() {
        // Disable all elements in the UI to avoid data changing halfway through the update
        disableEnableAll(true);

        var updatedEventObjs = [];
        var newEventObjs = [];
        var eventsToDelete = [];

        // For each term, go over each event and create an event object to persist
        _.each($('.gh-batch-edit-events-container'), function($termContainer) {
            // Loop over each (non-new) event in the term and create the event object
            _.each($('tbody tr.active:not(.gh-new-event-row)', $termContainer), function($eventContainer) {
                $eventContainer = $($eventContainer);

                // Gather the organisers for the field
                var organisers = getOrganiserState($eventContainer);

                // Create the updated event object
                var updatedEventObj = {
                    'id': $eventContainer.data('eventid'),
                    'displayName': $('.gh-event-description', $eventContainer).text(),
                    'end': $('.gh-event-date', $eventContainer).attr('data-end'),
                    'location': $('.gh-event-location', $eventContainer).text(),
                    'notes': $('.gh-event-type', $eventContainer).attr('data-type'),
                    'organisers': organisers || null,
                    'start': $('.gh-event-date', $eventContainer).attr('data-start')
                };
                updatedEventObjs.push(updatedEventObj);
            });

            // Loop over each new event in the term and create the event object
            _.each($('tbody tr.active.gh-new-event-row', $termContainer), function($eventContainer) {
                $eventContainer = $($eventContainer);

                // Gather the organisers for the field
                var organisers = getOrganiserList($eventContainer);

                // Create the new event object
                var newEventObj = {
                    'tempId': $eventContainer.data('tempid'),
                    'displayName': $('.gh-event-description', $eventContainer).text(),
                    'end': $('.gh-event-date', $eventContainer).attr('data-end'),
                    'location': $('.gh-event-location', $eventContainer).text(),
                    'notes': $('.gh-event-type', $eventContainer).attr('data-type'),
                    'organiserOther': organisers.organiserOthers || null,
                    'organiserUsers': organisers.organiserUsers || null,
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
                    // Re-enable all elements in the UI
                    disableEnableAll(false);

                    if (updateErr || newErr || deleteErr) {
                        // Show an error notification
                        return utils.notification('Events not updated.', 'Not all events could be successfully updated.', 'error');
                    }
                    // Hide the save button
                    toggleSubmit();
                    // Show a success notification to the user
                    return utils.notification('Events updated.', 'The events where successfully updated.');
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
        gh.api.seriesAPI.getSeries(seriesId, null, function(err, series) {
            if (err) {
                return utils.notification('Series not retrieved.', 'The event series could not be successfully retrieved.', 'error');
            }

            // Object used to aggregate the events between pages
            var events = {
                'results': []
            };

            /**
             * Get the events in a series per page of 25. Calls itself when it feels like there might be more
             *
             * @param  {Number}      offset      The paging number of the results to retrieve
             * @param  {Function}    callback    Standard callback function
             * @private
             */
            var getSeriesEvents = function(offset, callback) {
                // Get the information about the events in the series
                gh.api.seriesAPI.getSeriesEvents(seriesId, 25, offset, false, function(err, _events) {
                    if (err) {
                        return utils.notification('Events not retrieved.', 'The events could not be successfully retrieved.', 'error');
                    }

                    // Aggregate the results
                    events.results = _.union(events.results, _events.results);

                    // If the length of the Array of _events is 25 there might be other results so
                    // we increase the offset and fetch again
                    if (_events.results.length === 25) {
                        offset = offset + 25;
                        getSeriesEvents(offset, callback);
                    } else {
                        callback();
                    }
                });
            };

            // Get the first page of events
            getSeriesEvents(0, function() {
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
                $(document).trigger('gh.batchorganiser.setup');
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
        $('body').on('click', '.gh-event-date:not(.gh-disabled)', function() {
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
        $('body').on('click', '.gh-event-delete > button', deleteEvent);

        // Batch edit form submission and cancel
        $('body').on('click', '#gh-batch-edit-submit', submitBatchEdit);
        $('body').on('click', '#gh-batch-edit-cancel', loadSeriesEvents);
        $(document).on('gh.batchedit.togglesubmit', toggleSubmit);

        // Batch edit header functionality
        $('body').on('keyup', '#gh-batch-edit-title', batchEditTitle);
        $('body').on('keyup', '#gh-batch-edit-location', batchEditLocation);
        $('body').on('change', '#gh-batch-edit-type', batchEditType);
        $('body').on('click', '#gh-batch-edit-time', toggleBatchEditDate);

        // Keyboard accessibility
        $('body').on('keypress', 'td.gh-jeditable-events', handleEditableKeyPress);
        $('body').on('keypress', 'td.gh-jeditable-events-select', handleEditableKeyPress);
        $('body').on('keypress', 'td.gh-event-organisers', handleEditableKeyPress);

        // Tabs
        $(document).on('shown.bs.tab', '#gh-batch-edit-view .gh-toolbar-primary a[data-toggle="tab"]', function(ev) {
            // Only set up the calendar if that tab is active
            if ($(ev.target).attr('aria-controls') === 'gh-batch-calendar-view') {
                setUpPreviewCalendar();
            }
        });
    };

    addBinding();
});
