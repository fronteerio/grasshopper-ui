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

define(['gh.core', 'moment', 'clickover'], function(gh, moment) {


    ////////////////
    //  CALENDAR  //
    ////////////////

    // Cache the calendar object
    var calendar = null;

    // Set the default view
    var currentView = 'agendaWeek';

    // Object used to cache the triposData received on initialisation
    var triposData = null;

    // Get the start and end dates for the terms
    var terms = gh.api.configAPI.getAppTerm();

    /**
     * Change the calendar's current period
     *
     * @private
     */
    var changePeriod = function() {

        // Cache the clicked button
        var $button = $(this);
        // Retrieve the button's action
        var action = $button.attr('data-action');
        // Update the calendar
        calendar.fullCalendar(action);

        // Set the current day
        setCurrentDay();
        // Set the period label
        setPeriodLabel();
        // Set the term label
        setTermLabel();
        // Track the week change in GA
        gh.api.utilAPI.sendTrackingEvent('calendar', 'view', 'Navigate to ' + action + ' week');

        // Fetch the user's events
        getUserEvents();
    };

    /**
     * Change the calendar's current term
     *
     * @private
     */
    var changeTerm = function() {

        // Cache the clicked button
        var $button = $(this);
        // Retrieve the button's action
        var action = $button.attr('data-action');
        // Get the current term
        var currentTerm = getCurrentTerm(getCurrentViewDate());

        // Retrieve the term to navigate to, based on the current term
        var term = null;
        if (currentTerm) {
            if (action === 'next') {
                term = getNextTerm(currentTerm);
            } else {
                term = getPreviousTerm(currentTerm);
            }
        // This gets called when you are inbetween terms
        } else {
            if (action === 'next') {
                term = getNearestTerm(currentTerm, 'start');
            } else {
                term = getNearestTerm(currentTerm, 'end');
            }
        }

        // Navigate to a specific date in the calendar
        calendar.fullCalendar('gotoDate', term.start);

         // Set the current day
        setCurrentDay();
        // Set the week label
        setPeriodLabel();
        // Set the term label
        setTermLabel();
        // Track the term change in GA
        gh.api.utilAPI.sendTrackingEvent('calendar', 'view', 'Navigate to ' + action + ' ' + term.label + ' term');

        // Fetch the user's events
        getUserEvents();
    };

    /**
     * Change the calendar's current view
     *
     * @private
     */
    var changeView = function() {

        // Cache the clicked button
        var $button = $(this);
        // Retrieve the view
        currentView = $button.attr('data-view');
        // Change the view
        calendar.fullCalendar('changeView', currentView);
        // Remove the active status from the previous button
        $('#gh-calendar-toolbar-views .active').removeClass('active').addClass('default');
        // Update the button's status
        $button.removeClass('default').addClass('active');

        // Set the current day
        setCurrentDay();
        // Set the period label
        setPeriodLabel();
        // Set the term label
        setTermLabel();

        // Track the view change in GA
        gh.api.utilAPI.sendTrackingEvent('calendar', 'view', 'Change calendar view to ' + currentView);

        // Fetch the user's events
        getUserEvents();
    };

    /**
     * Change the current view to today's view
     *
     * @private
     */
    var navigateToToday = function() {
        // Navigate to today
        calendar.fullCalendar('today');
        // Set the current day
        setCurrentDay();
        // Set the week label
        setPeriodLabel();
        // Set the term label
        setTermLabel();

        // Track the today click in GA
        gh.api.utilAPI.sendTrackingEvent('calendar', 'view', 'Navigate to today');

        // Fetch the user's events
        getUserEvents();
    };

    /**
     * Get the user's events for the current view's time span
     *
     * @private
     */
    var getUserEvents = function() {
        // Only attempt to get the user's calendar when not anonymous
        if (!gh.data.me.anon) {

            // Determine the date range for which to get the user's events
            gh.api.utilAPI.getCalendarDateRange(function(range) {
                gh.api.userAPI.getUserCalendar(gh.data.me.id, range.start, range.end, function(err, data) {
                    if (err) {
                        return gh.api.utilAPI.notification('Fetching user calendar failed.', 'An error occurred while fetching the user calendar.', 'error');
                    }

                    // Update the calendar
                    updateCalendar(data.results);
                });
            });
        }
    };

    /**
     * Refresh the calendar
     *
     * @param  {Object}      data             The dispatched event
     * @param  {Event[]}     data.events      The user's subscribed events
     * @param  {Function}    data.callback    Standard callback function
     * @private
     */
    var refreshCalendar = function(ev, data) {
        if (data.callback && !_.isFunction(data.callback)) {
            throw new Error('A valid callback function should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        data.callback = data.callback || function() {};

        // Replace the calendar's events
        updateCalendar(data.events);
        // Invoke the callback function
        data.callback();
    };

    /**
     * Update the calendar event object
     *
     * @param  {Event[]}    events    Array containing the user's events
     * @private
     */
    var updateCalendar = function(events) {
        // Remove the existing events
        calendar.fullCalendar('removeEvents');
        // Manipulate the dates so they always display in GMT+0
        gh.api.utilAPI.fixDatesToGMT(events);
        // Get the event context
        getEventContext(events);
        // Replace the calendar's events
        calendar.fullCalendar('addEventSource', events);
    };

    /**
     * Highlight the header of the current day by adding a class
     *
     * @private
     */
    var setCurrentDay = function() {
        var selectedDay = $('.fc-today').index();
        $('.fc-widget-header table th:nth-child(' + (selectedDay + 1) + ')').addClass('fc-today');
    };

    /**
     * Set the period label
     *
     * @private
     */
    var setPeriodLabel = function() {
        var label = calendar.fullCalendar('getView').title;
        if (currentView === 'agendaWeek') {

            // Get the current academic week number
            var weekNumber = getCurrentAcademicWeekNumber();

            // Set the label
            label = 'Outside term';
            if (weekNumber) {
                label = 'Week ' + weekNumber;
            }
        }
        $('#gh-toolbar-label-period').html(label);
    };

    /**
     * Set the term label
     *
     * @private
     */
    var setTermLabel = function() {

        // Get the current term
        var term = getCurrentTerm(getCurrentViewDate());

        // Set the label
        var label = 'Outside term';
        if (term) {
            label = term.label;
        }

        $('#gh-toolbar-label-term').html(label);
    };


    //////////////
    //  EVENTS  //
    //////////////

    /**
     * Export the calendar
     *
     * @private
     */
    var exportCalendar = function() {
        // Toggle the `export-enabled` class on the calendar view to move the components aside
        $('#gh-calendar-view').toggleClass('gh-export-enabled');
        // Set the width of the button to avoid smaller size when toggling the label
        $('#gh-btn-calendar-export').width($('#gh-btn-calendar-export > div').width());
        // Toggle the label in the export button
        $('#gh-btn-calendar-export > div').toggle();
        // Set focus to the Subscribe button
        $('#gh-export-subscribe').focus();
    };

    /**
     * Toggle the `other options` button icon when clicked
     *
     * @private
     */
    var toggleExportOptions = function() {
        $(this).find('i').toggleClass('fa-caret-right fa-caret-down');
    };

    /**
     * Print the calendar
     *
     * @private
     */
    var printCalendar = function() {
        // Track the print event in GA
        gh.api.utilAPI.sendTrackingEvent('export', 'print', 'Print the calendar');
        return window.print();
    };


    ////////////
    //  UTIL  //
    ////////////

    /**
     * Return the current academic week number if the current date is within a term
     *
     * @return {Number}    The academic week number
     * @private
     */
    var getCurrentAcademicWeekNumber = function() {
        var currentViewDate = getCurrentViewDate();
        var currentTerm = getCurrentTerm(currentViewDate);
        if (!currentTerm) {
            return null;
        }

        // Current term
        var startDate = gh.api.utilAPI.convertISODatetoUnixDate(currentTerm.start);

        // Return the current academic week number
        var weekNumber = Math.floor((currentViewDate - startDate) / (1000 * 60 * 60 * 24 * 7)) + 1;

        if (weekNumber > 8) {
            weekNumber = null;
        }
        return weekNumber;
    };

    /**
     * Return the current term if the current date is within a term
     *
     * @param  {Number}    date    The date in a UNIX time format
     * @return {String}            The term
     * @private
     */
    var getCurrentTerm = function(date) {
        // Get the current term and return its name
        return _.find(terms, function(term) {
            var startDate = gh.api.utilAPI.convertISODatetoUnixDate(term.start);
            var endDate = gh.api.utilAPI.convertISODatetoUnixDate(term.end);
            if (gh.api.utilAPI.isDateInRange(date, startDate, endDate)) {
                return term.name;
            }
        });
    };

    /**
     * Return the current view
     *
     * @return {String}    The calendar's current view (e.g. 'month', 'week', 'day'...)
     * @private
     */
    var getCurrentView = function() {
        return calendar.fullCalendar('getView')['intervalUnit'];
    };

    /**
     * Return the start date of the current view in UNIX format
     *
     * @return {Number}    The start date of the current view in a UNIX time format
     * @private
     */
    var getCurrentViewDate = function() {
        // Get the start date from the current calendar view
        var viewStartDate = calendar.fullCalendar('getDate')['_d'];
        // Convert the Moment object to a UTC date
        return moment(viewStartDate).utc().valueOf();
    };

    /**
     * Get the context (course - subject / part) that goes with each event to be
     * rendered on the calendar and put it on the event object
     *
     * @param  {Object[]}    events    An Array of events to grab the context for
     * @private
     */
    var getEventContext = function(events) {
        // Loop over all events
        _.each(events, function(ev) {
            // Only grab extra context if the necessary data is available on the event
            if (ev.context) {
                // Grab the part associated to the event
                var partParent = _.find(triposData.parts, function(part) {
                    return ev.context.ParentId === part.id;
                });
                // Grab the subject associated to the event. Note that this might
                // not always be present
                var subjectParent = _.find(triposData.subjects, function(subject) {
                    return partParent.ParentId === subject.id;
                });
                // Grab the course associated to the event
                var courseParent = _.find(triposData.courses, function(course) {
                    if (subjectParent) {
                        return subjectParent.ParentId === course.id;
                    }
                    return partParent.ParentId === course.id;
                });
                // Put the course, subject and part on the event object
                ev.context.part = partParent;
                ev.context.subject = subjectParent;
                ev.context.course = courseParent;
            }
        });
    };

    /**
     * Return a term by its name
     *
     * @param  {String}    name    The name of the term
     * @return {Object}            Object containing term data
     * @private
     */
    var getTermByName = function(name) {
        return _.find(terms, {'name': name});
    };

    /**
     * Return the nearest term
     *
     * @param  {String}    term        Object containing the current term data
     * @param  {String}    property    The term property that is used to calculate the difference
     * @return {Object}                Object containing the next term data
     * @private
     */
    var getNearestTerm = function(term, property) {

        // Get the term start dates and covert them to a UNIX format
        var termDates = _.map(terms, function(term) {
            return {
                'name': term.name,
                'date': gh.api.utilAPI.convertISODatetoUnixDate(term[property])
            };
        });

        // Pick the nearest start date
        var nearest = _.first(termDates);
        _.each(termDates, function(term) {
            if ((Math.abs(term.date - getCurrentViewDate())) < (Math.abs(nearest.date - getCurrentViewDate()))) {
                nearest = term;
            }
        });

        // Return the term
        return getTermByName(nearest.name);
    };

    /**
     * Return a following term
     *
     * @param  {String}    term    Object containing the current term data
     * @return {Object}            Object containing the next term data
     * @private
     */
    var getNextTerm = function(term) {
        var currentTermIndex = terms.indexOf(term);
        var nextIndex = currentTermIndex + 1;
        if (!terms[nextIndex]) {
            return terms[0];
        }
        return terms[nextIndex];
    };

    /**
     * Return a preceeding term
     *
     * @param  {String}    term    Object containing the current term data
     * @return {Object}            Object containing the previous term data
     * @private
     */
    var getPreviousTerm = function(term) {
        var currentTermIndex = terms.indexOf(term);
        var nextIndex = currentTermIndex - 1;
        if (!terms[nextIndex]) {
            return terms[terms.length - 1];
        }
        return terms[nextIndex];
    };


    ///////////////
    //  POPOVER  //
    ///////////////

    /**
     * Calculate the position of the popover window
     *
     * @param  {Object}    $trigger    A jQuery object representing the trigger
     * @return {String}                The popover's position
     * @private
     */
    var calculatePopoverPosition = function($trigger) {
        // Get the calendar's width
        var calendarWidth = $trigger.closest('table').width();
        // Get the event's offset
        var eventOffset = $trigger.offset().left - 360;
        // Get the event's width
        var eventWidth = $trigger.closest('.fc-event-container').width();
        // Get the popover's width
        var popoverWidth = $('.popover').width();

        // Set the position to left if there is not enough space to show the popover
        var position = 'right';
        if (calendarWidth - (eventOffset + eventWidth) < popoverWidth) {
            position = 'left';
        }

        return position;
    };

    /**
     * Hide the popovers on resize
     *
     * @param  {Object}    $trigger    A jQuery object representing the trigger
     * @private
     */
    var hidePopoverOnResize = function($trigger) {
        $(window).one('resize', function() {
            $trigger.trigger('click');
        });
    };


    ///////////////
    //  BINDING  //
    ///////////////

    /**
     * Set the height of the calendar view
     *
     * @private
     */
    var setCalendarHeight = function() {
        // Calculate the new height
        var height = window.innerHeight - 380;
        // Apply the new height on the calendar
        calendar.fullCalendar('option', 'height', height);
    };

    /**
     * Add event listeners to UI-components
     *
     * @private
     */
    var addBinding = function() {
        // Export the calendar
        $('#gh-btn-calendar-export').on('click', exportCalendar);
        // Toggle the other options for export
        $('#gh-export-collapsed-other-toggle').on('click', toggleExportOptions);
        // Print the calendar
        $('#gh-btn-calendar-print').on('click', printCalendar);
        // Navigate to the current day
        $('#gh-btn-calendar-today').on('click', navigateToToday);
        // Change the calendar's period
        $('#gh-calendar-toolbar-period button').on('click', changePeriod);
        // Change the calendar's term
        $('#gh-calendar-toolbar-terms button').on('click', changeTerm);
        // Change the calendar's view
        $('#gh-calendar-toolbar-views button').on('click', changeView);

        // Return the calendar's current view
        $(document).on('gh.calendar.getCurrentView', function(evt, callback) {
            return callback(getCurrentView());
        });

        // Return the calendar's current view date
        $(document).on('gh.calendar.getCurrentViewDate', function(evt, callback) {
            return callback(getCurrentViewDate());
        });

        // Navigate to today
        $(document).on('gh.calendar.navigateToToday', navigateToToday);

        // Refresh the calendar
        $(document).on('gh.calendar.refresh', refreshCalendar);

        // Resize the calendar
        $(window).on('resize', setCalendarHeight);
    };

     /**
      * Initialise FullCalendar on the page and bind event handlers for navigating it
      *
      * @param  {Event}       ev                         Standard event object
      * @param  {Object}      calendarData               The data associated to the calendar to render
      * @param  {Object[]}    calendarData.triposData    An Array of tripos data
      * @param  {Object[]}    calendarData.events        An Array of events to add to the calendar on initialisation
      * @private
      */
    var setUpCalendar = function(ev, calendarData) {
        // Create an empty array if there are no events yet
        var events = calendarData && calendarData.events && calendarData.events.results ? calendarData.events.results : [];

        // Manipulate the dates so they always display in GMT+0
        gh.api.utilAPI.fixDatesToGMT(events);

        if (calendarData && calendarData.triposData) {
            // Cache the triposData for later use
            triposData = calendarData.triposData;
            // Get the event context
            getEventContext(events);
        }

        // Initialize the calendar object
        calendar = $('#gh-calendar-container').fullCalendar({
            'header': false,
            'columnFormat': {
                'month': 'ddd',
                'week': 'ddd D/M',
                'day': 'dddd'
            },
            'allDaySlot': false,
            'defaultDate': Date.now(),
            'defaultView': currentView,
            'editable': false,
            'eventLimit': true,
            'firstDay': 4,
            'handleWindowResize': false,
            'maxTime': '20:00:00',
            'minTime': '07:00:00',
            'slotDuration': '00:30:00',
            'events': events,
            'eventRender': function(data) {
                return gh.api.utilAPI.renderTemplate($('#gh-event-template'), {
                    'data': data
                });
            }
        });

        // Show extra information for the event in a popover when it's clicked
        $('#gh-calendar-container').on('click', '.fc-event', function() {
            var eventId = $(this).data('id');
            var $trigger = $(this);
            var $content = $('.popover[data-id="' + eventId + '"]');

            // Wait until the current call stack cleared so we're sure
            // all popovers are hidden before adding a new one
            _.defer(function() {
                var options = {
                    'container': 'body',
                    'content': $content.html(),
                    'global_close': true,
                    'html': true,
                    'placement': calculatePopoverPosition($trigger),
                    'title': '',
                    'onHidden': function() {
                        $trigger.removeClass('highlighted');
                    },
                    'onShown': function() {
                        $trigger.addClass('highlighted');

                        // Hide the popover on resize
                        hidePopoverOnResize($trigger);

                        // Track the event details lookup in GA
                        gh.api.utilAPI.sendTrackingEvent('event', 'view', 'View event details', eventId);
                    }
                };

                $trigger.clickover(options);
                $trigger.trigger('click');
            });
        });

        // Add binding to various elements
        addBinding();
        // Set the current day
        setCurrentDay();
        // Set the calendar height
        setCalendarHeight();
        // Set the period label
        setPeriodLabel();
        // Set the term label
        setTermLabel();
    };

    // Initialise the calendar
    $(document).on('gh.calendar.init', setUpCalendar);

    // Inform the page that the calendar is ready to go so that
    // it can initialise the calendar when it's ready for it
    $(document).trigger('gh.calendar.ready');
});
