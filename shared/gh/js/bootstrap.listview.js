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
     * Get an event or multiple events by ID
     *
     * @param  {Number}    [parentId]    The ID of the parent of the event
     * @param  {Number}    [eventId]     The ID of the event to get
     * @return {Event[]}                 Array of events matching the IDs
     * @api private
     */
    var getEventById = function(parentId, eventId) {
        // Filter out the parent from the Array
        var parentByID = _.find(modules, function(par) {
            return par.id === parentId;
        });

        // Filter out the event from the parent
        var eventByID = _.find(parentByID.events, function(ev) {
            return ev.id === eventId;
        });
        return [eventByID];
    };

    /**
     * Get multiple events by ID of their parent
     *
     * @param  {Number}    parentId    The ID of the parent to get events for
     * @return {Event[]}               Array of events inside of the parent matching the ID
     */
    var getEventsById = function(parentId) {
        // Filter out the parent from the Array
        var parentByID = _.find(modules, function(par) {
            return par.id === parentId;
        });
        return parentByID.events;
    };

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
        // TODO: Move this into the callback
        var $list = $(this).closest('li');
        // Add `gh-list-group-item-added` to the list item
        $list.addClass('gh-list-group-item-added');
        // Add `gh-list-group-item-added` to all children of the list item
        $list.find('li').addClass('gh-list-group-item-added');
        // Change the icon of all button of the list item
        $list.find('i').removeClass('fa-plus').addClass('fa-remove');
        // Toggle the class from add-all to remove-all
        $(this).toggleClass('gh-add-all-to-calendar gh-remove-all-from-calendar');
        // Toggle the children's class from add to remove
        $list.find('li .gh-list-action .btn').removeClass('gh-add-to-calendar').addClass('gh-remove-from-calendar');

        // Get the events to add to the calendar
        var eventsToAdd = getEventsById($list.data('id'));
        $(document).trigger('gh.listview.addallevents', [{
            'callback': function() {
                // TODO: Implement the API calls that hook into this
                // This callback should be executed after all the database queries have
                // happened. If there's an error it should be passed back in here and
                // the list view should be appropriately updated (or not). Error notifications
                // shouldn't be handled in here as they are custom to the app
                gh.api.utilAPI.notification('Events added.', 'All events where successfully added to your calendar.');
            },
            'events': eventsToAdd
        }]);
    });

    /**
     * Remove all events in the module from the calendar
     */
    $('body').on('click', '.gh-remove-all-from-calendar', function() {
        // TODO: Move this into the callback
        var $list = $(this).closest('li');
        // Remove `gh-list-group-item-added` from the list item
        $list.removeClass('gh-list-group-item-added');
        // Remove `gh-list-group-item-added` from all children of the list item
        $list.find('li').removeClass('gh-list-group-item-added');
        // Change the icon of all button of the list item
        $list.find('i').removeClass('fa-remove').addClass('fa-plus');
        // Toggle the class from remove-all to add-all
        $(this).toggleClass('gh-add-all-to-calendar gh-remove-all-from-calendar');
        // Toggle the children's class from remove to add
        $list.find('li .gh-list-action .btn').removeClass('gh-remove-from-calendar').addClass('gh-add-to-calendar');

        // Get the events to remove from the calendar
        var eventsToRemove = getEventsById($list.data('id'));
        $(document).trigger('gh.listview.removeallevents', [{
            'callback': function() {
                // TODO: Implement the API calls that hook into this
                // This callback should be executed after all the database queries have
                // happened. If there's an error it should be passed back in here and
                // the list view should be appropriately updated (or not). Error notifications
                // shouldn't be handled in here as they are custom to the app
                gh.api.utilAPI.notification('Events removed.', 'All events where successfully removed from your calendar.');
            },
            'events': eventsToRemove
        }]);
    });

    /**
     * Add a single event to the calendar
     */
    $('body').on('click', '.gh-add-to-calendar', function() {
        // TODO: Move this into the callback
        // Toggle the event's item-added class
        $(this).closest('li').toggleClass('gh-list-group-item-added');
        // Toggle the event's button class
        $(this).toggleClass('gh-add-to-calendar gh-remove-from-calendar');
        // Toggle the event's button icon
        $(this).find('i').toggleClass('fa-plus fa-remove');

        // Only change the parent's styles if all events have been subscribed to
        var events = $(this).closest('ul').find('li').length;
        var addedEvents = $(this).closest('ul').find('li.gh-list-group-item-added').length;
        if (events === addedEvents) {
            var $parentList = $(this).closest('ul').closest('li');
            // Remove the parent's 'gh-list-group-item-added' class
            $parentList.addClass('gh-list-group-item-added');
            // Remove the parent's 'remove-all' class and change it to 'add-all'
            $parentList.find('.gh-list-action .btn').first().removeClass('gh-add-all-to-calendar').addClass('gh-remove-all-from-calendar');
            // Change the icon of the parent's list item button
            $parentList.find('.gh-list-action .btn i').first().removeClass('fa-plus').addClass('fa-remove');
        }

        // Get the events to add to the calendar
        var eventsToAdd = getEventById($(this).closest('ul').closest('li').data('id'), $(this).closest('li').data('id'));
        $(document).trigger('gh.listview.addevent', [{
            'callback': function() {
                // TODO: Implement the API calls that hook into this
                // This callback should be executed after all the database queries have
                // happened. If there's an error it should be passed back in here and
                // the list view should be appropriately updated (or not). Error notifications
                // shouldn't be handled in here as they are custom to the app
                gh.api.utilAPI.notification('Event added.', 'The event was successfully added to your calendar.');
            },
            'events': eventsToAdd
        }]);
    });

    /**
     * Remove a single event from the calendar
     */
    $('body').on('click', '.gh-remove-from-calendar', function() {
        // TODO: Move this into the callback
        // Toggle the event's item-added class
        $(this).closest('li').toggleClass('gh-list-group-item-added');
        // Toggle the event's button class
        $(this).toggleClass('gh-add-to-calendar gh-remove-from-calendar');
        // Toggle the event's button icon
        $(this).find('i').toggleClass('fa-plus fa-remove');

        var $parentList = $(this).closest('ul').closest('li');
        // Remove the parent's 'gh-list-group-item-added' class
        $parentList.removeClass('gh-list-group-item-added');
        // Remove the parent's 'remove-all' class and change it to 'add-all'
        $parentList.find('.gh-list-action .btn').first().removeClass('gh-remove-all-from-calendar').addClass('gh-add-all-to-calendar');
        // Change the icon of the parent's list item button
        $parentList.find('.gh-list-action .btn i').first().removeClass('fa-remove').addClass('fa-plus');

        // Get the events to remove from the calendar
        var eventsToRemove = getEventById($(this).closest('ul').closest('li').data('id'), $(this).closest('li').data('id'));
        $(document).trigger('gh.listview.removeevent', [{
            'callback': function() {
                // TODO: Implement the API calls that hook into this
                // This callback should be executed after all the database queries have
                // happened. If there's an error it should be passed back in here and
                // the list view should be appropriately updated (or not). Error notifications
                // shouldn't be handled in here as they are custom to the app
                gh.api.utilAPI.notification('Event removed.', 'The event was successfully removed from your calendar.');
            },
            'events': eventsToRemove
        }]);
    });

    $(document).on('gh.listview.init', function(ev, data) {
        modules = data.modules;
    });

    $(document).trigger('gh.listview.ready');
});
