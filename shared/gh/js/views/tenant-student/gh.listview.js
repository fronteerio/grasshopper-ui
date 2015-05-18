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

define(['gh.core', 'gh.constants', 'gh.student.login-modal', 'gh.student.module-borrowed', 'gh.student.series-info', 'gh.student.series-borrowed-published-popover', 'gh.series-borrowed-popover', 'clickover'], function(gh, constants) {

    var modules = null;


    ///////////////////
    //  SUBSCRIBING  //
    ///////////////////

    /**
     * Add all events in the module to the calendar
     *
     * @private
     */
    var addAllToCalendar = function() {
        if (gh.data.me.anon) {
            return $(document).trigger('gh.login-modal.show', {'data': {'trigger': $(this)}});
        }

        var $list = $(this).closest('li');
        var $this = $(this);

        // Get the moduleId to subscribe to
        var moduleId = $list.data('id');

        // Subscribe to the module
        gh.api.orgunitAPI.subscribeOrgUnit(moduleId, function(err, data) {
            if (err) {
                // Show a failure notification
                return gh.utils.notification('The events could not be added to your calendar', constants.messaging.default.error, 'error');
            }

            // Send a tracking event when a user adds all events in the module to the calendar
            gh.utils.trackEvent(['Calendar', 'Manage', 'Module added']);
            // Add `gh-list-group-item-added` to the list item
            $list.addClass('gh-list-group-item-added');
            // Add `gh-list-group-item-added` to all children of the list item
            $list.find('li').addClass('gh-list-group-item-added');
            // Change the icon of all button of the list item
            $list.find('i').removeClass('fa-plus').removeClass('fa-minus').addClass('fa-remove');
            // Toggle the class from add-all to remove-all
            $this.toggleClass('gh-add-all-to-calendar gh-remove-all-from-calendar');
            // Toggle the children's class from add to remove
            $list.find('li .gh-list-action .btn').removeClass('gh-add-to-calendar').addClass('gh-remove-from-calendar');

            // Determine the date range for which to get the user's events
            gh.utils.getCalendarDateRange(function(range) {
                // Only attempt to get the user's calendar when not anonymous
                gh.api.userAPI.getUserCalendar(gh.data.me.id, range.start, range.end, function(err, events) {
                    // Refresh the calendar view
                    $(document).trigger('gh.calendar.refresh', [{
                        'callback': function() {
                            // Show a success notification
                            gh.utils.notification('Events successfully added to your calendar', null, 'success', 'notification-events-added');
                        },
                        'events': events.results
                    }]);
                    // Refresh the agenda view
                    $(document).trigger('gh.agendaview.refresh');
                });
            });
        });
    };

    /**
     * Remove all events in the module from the calendar
     *
     * @private
     */
    var removeAllFromCalendar = function() {
        if (gh.data.me.anon) {
            return $(document).trigger('gh.login-modal.show', {'data': {'trigger': $(this)}});
        }

        var $list = $(this).closest('li');
        var $this = $(this);

        // Get the moduleId to unsubscribe from
        var moduleId = $list.data('id');

        // Unsubscribe from the module
        gh.api.orgunitAPI.unsubscribeOrgUnit(moduleId, function(err, data) {
            if (err) {
                // Show a failure notification
                return gh.utils.notification('The events could not be removed from your calendar', constants.messaging.default.error, 'error');
            }

            // Send a tracking event when a user removes all events in the module from the calendar
            gh.utils.trackEvent(['Calendar', 'Manage', 'Module removed']);
            // Remove `gh-list-group-item-added` from the list item
            $list.removeClass('gh-list-group-item-added');
            // Remove `gh-list-group-item-added` from all children of the list item
            $list.find('li').removeClass('gh-list-group-item-added');
            // Change the icon of all button of the list item
            $list.find('i').removeClass('fa-remove').addClass('fa-plus');
            // Toggle the class from remove-all to add-all
            $this.toggleClass('gh-add-all-to-calendar gh-remove-all-from-calendar');
            // Toggle the children's class from remove to add
            $list.find('li .gh-list-action .btn').removeClass('gh-remove-from-calendar').addClass('gh-add-to-calendar');

            // Determine the date range for which to get the user's events
            gh.utils.getCalendarDateRange(function(range) {
                // Only attempt to get the user's calendar when not anonymous
                gh.api.userAPI.getUserCalendar(gh.data.me.id, range.start, range.end, function(err, events) {
                    // Refresh the calendar view
                    $(document).trigger('gh.calendar.refresh', [{
                        'callback': function() {
                            // Show a success notification
                            gh.utils.notification('Events successfully removed from your calendar', null, 'success', 'notification-events-removed');
                        },
                        'events': events.results
                    }]);
                    // Refresh the agenda view
                    $(document).trigger('gh.agendaview.refresh');
                });
            });
        });
    };

    /**
     * Add a single event to the calendar
     *
     * @private
     */
    var addToCalendar = function() {
        if (gh.data.me.anon) {
            return $(document).trigger('gh.login-modal.show', {'data': {'trigger': $(this)}});
        }

        var $this = $(this);

        // Get the seriesId to subscribe to
        var seriesId = $this.closest('li').data('id');

        // Subscribe to the series
        var moduleId = $this.closest('ul').closest('li').data('id');
        gh.api.seriesAPI.subscribeSeries(seriesId, null, moduleId, function(err, data) {
            if (err) {
                // Show a failure notification
                return gh.utils.notification('The event could not be added to your calendar', constants.messaging.default.error, 'error');
            }

            // Send a tracking event when a user adds an event series to the calendar
            gh.utils.trackEvent(['Calendar', 'Manage', 'Series added']);
            // Toggle the event's item-added class
            $this.closest('li').toggleClass('gh-list-group-item-added');
            // Toggle the event's button class
            $this.toggleClass('gh-add-to-calendar gh-remove-from-calendar');
            // Toggle the event's button icon
            $this.find('i').toggleClass('fa-plus fa-remove');

            // Change the parent's style if one or more events have been subscribed to
            var events = $this.closest('ul').find('li').length;
            var addedEvents = $this.closest('ul').find('li.gh-list-group-item-added').length;

            // Fetch the list's parent
            var $parentList = $this.closest('ul').closest('li');

            if (events === addedEvents) {
                // Remove the parent's 'gh-list-group-item-added' class
                $parentList.addClass('gh-list-group-item-added');
                // Remove the parent's 'remove-all' class and change it to 'add-all'
                $parentList.find('.gh-list-action .btn').first().removeClass('gh-add-all-to-calendar').addClass('gh-remove-all-from-calendar');
                // Change the icon of the parent's list item button
                $parentList.find('.gh-list-action .btn i').first().removeClass('fa-minus').addClass('fa-remove');
            } else if (addedEvents > 0 && addedEvents < events) {
                // Change the icon of the parent's list item button
                $parentList.find('.gh-list-action .btn i').first().removeClass('fa-plus').addClass('fa-minus');
            }

            // Determine the date range for which to get the user's events
            gh.utils.getCalendarDateRange(function(range) {
                // Only attempt to get the user's calendar when not anonymous
                gh.api.userAPI.getUserCalendar(gh.data.me.id, range.start, range.end, function(err, events) {
                    // Refresh the calendar view
                    $(document).trigger('gh.calendar.refresh', [{
                        'callback': function() {
                            // Show a success notification
                            gh.utils.notification('Event successfully added to your calendar', null, 'success', 'notification-events-added');
                        },
                        'events': events.results
                    }]);
                    // Refresh the agenda view
                    $(document).trigger('gh.agendaview.refresh');
                });
            });
        });
    };

    /**
     * Remove a single event from the calendar
     *
     * @private
     */
    var removeFromCalendar = function() {
        if (gh.data.me.anon) {
            return $(document).trigger('gh.login-modal.show', {'data': {'trigger': $(this)}});
        }

        var $this = $(this);

        // Get the seriesId to unsubscribe from
        var seriesId = $this.closest('li').data('id');

        // Subscribe to the series
        gh.api.seriesAPI.unsubscribeSeries(seriesId, function(err, data) {
            if (err) {
                // Show a failure notification
                return gh.utils.notification('Could not remove the event from your calendar', constants.messaging.default.error, 'error');
            }

            // Send a tracking event when a user removes all events in the module from the calendar
            gh.utils.trackEvent(['Calendar', 'Manage', 'Series removed']);
            // Toggle the event's item-added class
            $this.closest('li').toggleClass('gh-list-group-item-added');
            // Toggle the event's button class
            $this.toggleClass('gh-add-to-calendar gh-remove-from-calendar');
            // Toggle the event's button icon
            $this.find('i').toggleClass('fa-plus fa-remove');

            // Change the parent's style if one or more events have been subscribed to
            var events = $this.closest('ul').find('li').length;
            var addedEvents = $this.closest('ul').find('li.gh-list-group-item-added').length;

            // Fetch the list's parent
            var $parentList = $this.closest('ul').closest('li');

            // Remove the parent's 'gh-list-group-item-added' class
            $parentList.removeClass('gh-list-group-item-added');
            // Remove the parent's 'remove-all' class and change it to 'add-all'
            $parentList.find('.gh-list-action .btn').first().removeClass('gh-remove-all-from-calendar').addClass('gh-add-all-to-calendar');

            if (addedEvents === 0) {
                // Change the icon of the parent's list item button
                $parentList.find('.gh-list-action .btn i').first().removeClass('fa-minus').addClass('fa-plus');
            } else if (addedEvents > 0 && addedEvents < events) {
                // Change the icon of the parent's list item button
                $parentList.find('.gh-list-action .btn i').first().removeClass('fa-remove').addClass('fa-minus');
            }

            // Determine the date range for which to get the user's events
            gh.utils.getCalendarDateRange(function(range) {

                // Only attempt to get the user's calendar when not anonymous
                gh.api.userAPI.getUserCalendar(gh.data.me.id, range.start, range.end, function(err, events) {
                    // Refresh the calendar view
                    $(document).trigger('gh.calendar.refresh', [{
                        'callback': function() {
                            // Show a success notification
                            gh.utils.notification('Event successfully removed from your calendar', null, 'success', 'notification-events-removed');
                        },
                        'events': events.results
                    }]);
                    // Refresh the agenda view
                    $(document).trigger('gh.agendaview.refresh');
                });
            });
        });
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add binding to various student list view elements
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('click', '.gh-add-all-to-calendar', addAllToCalendar);
        $('body').on('click', '.gh-remove-all-from-calendar', removeAllFromCalendar);
        $('body').on('click', '.gh-add-to-calendar', addToCalendar);
        $('body').on('click', '.gh-remove-from-calendar', removeFromCalendar);
        $('body').on('click', '.list-group .list-group-item .list-group .list-group-item .gh-list-description', function() {
            $($(this).nextAll().find('button')).click();
        });
    };

    addBinding();
});
