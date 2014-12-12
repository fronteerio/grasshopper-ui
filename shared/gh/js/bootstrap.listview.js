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

define(['gh.core'], function(gh) {

    var modules = null;

    /**
     * Toggle a list item's children's visibility and update the icon classes
     */
    $('body').on('click', '.gh-toggle-list', function() {
        // Toggle the child lists
        $(this).closest('.list-group-item').toggleClass('gh-list-group-item-open');
        // Toggle the caret class of the icon that was clicked
        $(this).find('i').toggleClass('fa-caret-right fa-caret-down');
    });

    /**
     * Add all events in the module to the calendar
     */
    $('body').on('click', '.gh-add-all-to-calendar', function() {
        var $list = $(this).closest('li');
        var $this = $(this);

        // Get the moduleId to subscribe to
        var moduleId = $list.data('id');

        // Subscribe to the module
        gh.api.orgunitAPI.subscribeOrgUnit(moduleId, function(err, data) {
            // TODO: Enable error handling when the API endpoint has been implemented
            // if (err) {
            //     // Show a failure notification
            //     return gh.api.utilAPI.notification('Events not added.', 'The events could not be successfully added to your calendar.', 'error');
            // }

            // Show a success notification
            gh.api.utilAPI.notification('Events added.', 'All events where successfully added to your calendar.', 'success', 'notification-events-added');

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
        });
    });

    /**
     * Remove all events in the module from the calendar
     */
    $('body').on('click', '.gh-remove-all-from-calendar', function() {
        var $list = $(this).closest('li');
        var $this = $(this);

        // Get the moduleId to unsubscribe from
        var moduleId = $list.data('id');

        // Unsubscribe from the module
        gh.api.orgunitAPI.unsubscribeOrgUnit(moduleId, function(err, data) {
            // TODO: Enable error handling when the API endpoint has been implemented
            // if (err) {
            //     // Show a failure notification
            //     return gh.api.utilAPI.notification('Events not removed.', 'The events could not be successfully removed from your calendar.', 'error');
            // }

            // Show a success notification
            gh.api.utilAPI.notification('Events removed.', 'The events were successfully removed from your calendar.', 'success', 'notification-events-removed');

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

        });
    });

    /**
     * Add a single event to the calendar
     */
    $('body').on('click', '.gh-add-to-calendar', function() {
        var $this = $(this);

        // Get the seriesId to subscribe to
        var seriesId = $this.closest('li').data('id');

        // Subscribe to the series
        gh.api.seriesAPI.subscribeSeries(seriesId, function(err, data) {
            // TODO: Enable error handling when the API endpoint has been implemented
            // if (err) {
            //     // Show a failure notification
            //     return gh.api.utilAPI.notification('Events not added.', 'The events could not be successfully added to your calendar.', 'error');
            // }

            // Show a success notification
            gh.api.utilAPI.notification('Events added.', 'All events where successfully added to your calendar.', 'success', 'notification-events-added');

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

            // Fetch the user's events
            gh.api.userAPI.getUserCalendar(gh.data.me.id, '2010-01-01', '2015-12-31', function(err, events) {
                $(document).trigger('gh.calendar.refresh', [{
                    'callback': function() {
                        // Show a success notification
                        gh.api.utilAPI.notification('Events added.', 'All events where successfully added to your calendar.');
                    },
                    'events': events.results
                }]);
            });
        });
    });

    /**
     * Remove a single event from the calendar
     */
    $('body').on('click', '.gh-remove-from-calendar', function() {
        var $this = $(this);

        // Get the seriesId to unsubscribe from
        var seriesId = $this.closest('li').data('id');

        // Subscribe to the series
        gh.api.seriesAPI.unsubscribeSeries(seriesId, function(err, data) {
            // TODO: Enable error handling when the API endpoint has been implemented
            // if (err) {
            //     // Show a failure notification
            //     return gh.api.utilAPI.notification('Event not removed.', 'The event could not be successfully removed from your calendar.', 'error');
            // }

            // Show a success notification
            gh.api.utilAPI.notification('Event removed.', 'The event was successfully removed from your calendar.', 'success', 'notification-events-removed');

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

            // Fetch the user's events
            gh.api.userAPI.getUserCalendar(gh.data.me.id, '2010-01-01', '2015-12-31', function(err, events) {
                $(document).trigger('gh.calendar.refresh', [{
                    'callback': function() {
                        // Show a success notification
                        gh.api.utilAPI.notification('Event removed.', 'The event was successfully removed from your calendar.', 'success', 'notification-events-removed');
                    },
                    'events': events.results
                }]);
            });
        });
    });
});
