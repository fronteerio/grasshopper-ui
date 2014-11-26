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

    // Cache the calendar object
    var calendar = null;

    // Set the default view
    var currentView = 'agendaWeek';

    /**
     * Change the calendar's current period
     *
     * @param  {Event}    event    A jQuery event
     * @private
     */
    var changePeriod = function(event) {
        // Cache the clicked button
        var $button = $(event.currentTarget);
        // Retrieve the button's action
        var action = $button.attr('data-action');
        // Update the calendar
        calendar.fullCalendar(action);
        // Set the period label
        setPeriodLabel();
        // Set the current day
        setCurrentDay();
    };

    /**
     * Change the calendar's current term
     *
     * @param  {Event}    event    A jQuery event
     * @private
     */
    var changeTerm = function(event) {
        return false;
    };

    /**
     * Change the calendar's current view
     *
     * @param  {Event}    event    A jQuery event
     * @private
     */
    var changeView = function(event) {
        // Cache the clicked button
        var $button = $(event.currentTarget);
        // Retrieve the view
        currentView = $button.attr('data-view');
        // Change the view
        calendar.fullCalendar('changeView', currentView);
        // Remove the active status from the previous button
        $('#gh-calendar-toolbar-views .active').removeClass('active').addClass('default');
        // Update the button's status
        $button.removeClass('default').addClass('active');
        // Set the period label
        setPeriodLabel();
        // Set the current day
        setCurrentDay();
    };

    /**
     * Export the calendar
     *
     * @private
     */
    var exportCalendar = function() {
        return false;

        /**
         * TODO: wait for back-end implementation
         *
        if (gh.data.me) {
            gh.api.userAPI.getUserCalendarIcal(gh.data.me.id, null, function() {});
        }
         */
    };

    /**
     * Print the calendar
     *
     * @private
     */
    var printCalendar = function() {
        return window.print();
    };

    /**
     * Set the period label
     *
     * @api private
     */
    var setPeriodLabel = function() {
        var label = calendar.fullCalendar('getView').title;
        if (currentView === 'agendaWeek') {
            label = '{ACADEMIC_WEEK_NUMBER}';
        }
        $('#gh-toolbar-label-period').html(label);
    };

    /**
     * Highlight the header of the current day by adding a class
     */
    var setCurrentDay = function() {
        var selectedDay = $('.fc-today').index();
        $('.fc-widget-header table th:nth-child(' + (selectedDay + 1) + ')').addClass('fc-today');
    };

    /**
     * Add an Array of events to the calendar
     *
     * @param {Event}      ev      Standard event object
     * @param {Event[]}    data    Data object containing the events to add to the calendar
     */
    var addEventsToCalendar = function(ev, data) {
        $.each(data.events, function(index, ev) {
            calendar.fullCalendar('removeEvents', ev.id);
            calendar.fullCalendar('renderEvent', {
                'id': ev.id,
                'title': ev.displayName,
                'location': ev.location,
                'start': ev.start,
                'end': ev.end
            }, true);
        });
    };

    /**
     * Remove an Array of events from the calendar
     *
     * @param  {Event}      ev      Standard event object
     * @param  {Event[]}    data    Data object containing the events to remove from the calendar
     */
    var removeEventsFromCalendar = function(ev, data) {
        $.each(data.events, function(index, ev) {
            calendar.fullCalendar('removeEvents', ev.id);
        });
    };

    /**
     * Add event listeners to UI-components
     *
     * @api private
     */
    var addBinding = function() {
        // Export the calendar
        $('#gh-btn-calendar-export').on('click', exportCalendar);
        // Print the calendar
        $('#gh-btn-calendar-print').on('click', printCalendar);
        // Change the calendar's period
        $('#gh-calendar-toolbar-period button').on('click', changePeriod);
        // Change the calendar's term
        $('#gh-calendar-toolbar-terms button').on('click', changeTerm);
        // Change the calendar's view
        $('#gh-calendar-toolbar-views button').on('click', changeView);
        // Add the event to the calendar
        $(document).on('gh.listview.addevent', addEventsToCalendar);
        // Add the event to the calendar
        $(document).on('gh.listview.addallevents', addEventsToCalendar);
        // Remove the event from the calendar
        $(document).on('gh.listview.removeevent', removeEventsFromCalendar);
        // Remove the events from the calendar
        $(document).on('gh.listview.removeallevents', removeEventsFromCalendar);
    };

    /**
     * Initialize the calendar
     *
     * @api private
     */
    var initCalendar = function() {
        // Initialize the calendar object
        calendar = $('#gh-calendar-container').fullCalendar({
            'header': false,
            'columnFormat': {
                'month': 'ddd',
                'week': 'ddd D/M',
                'day': 'dddd'
            },
            'allDaySlot': false,
            'defaultDate': '2014-11-21',
            'defaultView': currentView,
            'editable': false,
            'eventLimit': true,
            'firstDay': 4,
            'handleWindowResize': true,
            'maxTime': '20:00:00',
            'minTime': '07:00:00',
            'slotDuration': '00:15:00',
            'events': [],
            'eventRender': function(ev, element) {
                return gh.api.utilAPI.renderTemplate($('#gh-event-template'), {
                    'data': ev
                });
            }
        });

        // Add binding to various elements
        addBinding();
        // Set the period label
        setPeriodLabel();
        // Set the current day
        setCurrentDay();
    };


    // Initialise the calendar
    $(document).on('gh.calendar.init', initCalendar);

    $(document).trigger('gh.calendar.ready');

});
