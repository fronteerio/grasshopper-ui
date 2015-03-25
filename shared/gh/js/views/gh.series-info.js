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

define(['gh.core', 'moment', 'clickover'], function(gh, moment) {

    // Cache the retrieved series
    var series = {};

    /**
     * Retrieve the series information
     *
     * @param  {Number}    seriesId    The ID of the series that needs to be retrieved
     * @private
     */
    var retrieveSeries = function(seriesId) {

        // Fetch the series if it hasn't been retrieved yet
        if (!series[seriesId]) {
            return gh.api.seriesAPI.getSeries(seriesId, false, function(err, data) {
                if (err) {
                    return console.error(err);
                }
                series[seriesId] = data;

                // Retrieve the events that belong to the series
                if (!series[seriesId]['Events']) {
                    series[seriesId]['Events'] = [];

                    /**
                     * Get the series's events
                     *
                     * @param  {Number}    offset    The paging number of the results to retrieve
                     * @private
                     */
                    var _getSeriesEvents = function(offset) {

                        // Set a default offset
                        offset = offset || 0;

                        //
                        gh.api.seriesAPI.getSeriesEvents(seriesId, 10, offset, true, function(err, data) {
                            if (err) {
                                return console.error(err);
                            }
                            series[seriesId]['Events'] = _.union(series[seriesId]['Events'], data.results);

                            if (data.results.length === 10) {
                                return _getSeriesEvents(offset += 10);
                            }
                            return retrieveSeries(seriesId);
                        });
                    };

                    // Start fetching the events for the series
                    return _getSeriesEvents();
                }
                return retrieveSeries(seriesId);
            });
        }

        // Template data object
        var data = {
            'utils': gh.utils,
            'displayName': series[seriesId]['displayName'],
            'terms': groupSeriesEventsByTerms(series[seriesId]['Events']),
            'locations': collectSeriesEventsLocations(series[seriesId]['Events']),
            'organisers': collectSeriesEventsOrganisers(series[seriesId]['Events'])
        };

        // Render the template into the series info container
        gh.utils.renderTemplate($('#gh-series-info-template'), {
            'data': data
        }, $('.popover.gh-series-popover').find('.series-info-container'));
    };

    /**
     * Collect the series events's locations
     *
     * @param  {Object[]}    events    A collection of series events
     * @return {String[]}              A collection of locations
     * @private
     */
    var collectSeriesEventsLocations = function(events) {
        return _.compact(_.uniq(_.pluck(events, 'location')));
    };

    /**
     * Collect the series events's organisers
     *
     * @param  {Object[]}    events    A collection of series events
     * @return {String[]}              A collection of organisers
     * @private
     */
    var collectSeriesEventsOrganisers = function(events) {
        return _.uniq(_.flatten(_.map(_.pluck(events, 'organisers'), function(_organisers) {
            return _.map(_organisers, function(organiser) {
                if (_.isObject(organiser)) {
                    return organiser.displayName;
                }
                return organiser;
            });
        })));
    };

    /**
     * Process the series's events
     *
     * @param  {Object[]}    events    A collection of series events
     * @return {Object}                Object containing the events grouped by term
     * @private
     */
    var groupSeriesEventsByTerms = function(events) {

        // Cache the terms
        var _terms = _.map(gh.config.terms[gh.config.academicYear], function(term) { return _.clone(term); });

        // Add the events to the corresponding term
        _.each(events, function(evt) {
            var eventStartDate = gh.utils.convertISODatetoUnixDate(evt.start);

            _.each(_terms, function(term) {
                if (!term.events) {
                    term.events = [];
                }

                // Check if the start date is in the range of the terms start and end date
                var termStartDate = gh.utils.convertISODatetoUnixDate(term.start);
                var termEndDate = gh.utils.convertISODatetoUnixDate(term.end);
                if (eventStartDate >= termStartDate && eventStartDate <= termEndDate) {
                    term['events'].push(evt);
                }
            });
        });

        return _terms;
    };


    ///////////////
    //  POPOVER  //
    ///////////////

    /**
     * Set up and show the series popover
     *
     * @private
     */
    var setUpSeriesPopover = function() {
        var $trigger = $(this);

        // Store the series ID
        var seriesId = $trigger.data('id');

        // Render the popover window
        gh.utils.renderTemplate($('#gh-series-info-popover-template'), {
            'data': {
                'id': seriesId
            }
        }, $('.gh-series-info-popover-container[data-id="' + seriesId + '"]'));

        // Show the popover window
        var $content = $trigger.closest('.gh-list-group-item-container').find('.popover[data-id="' + seriesId + '"]');

        var options = {
            'class_name': 'gh-series-popover',
            'container': 'body',
            'content': $content.html(),
            'global_close': true,
            'html': true,

            // Retrieve the series information for display in the popover
            'onShown': function() {
                retrieveSeries(seriesId);
            }
        };

        $trigger.clickover(options);
        $trigger.trigger('click');
    };

    /**
     * Dismiss the series popover
     *
     * @private
     */
    var dismissSeriesPopover = function() {
        var $trigger = $(this);
        if ($('.popover.in').length) {
            $trigger.trigger('click');
        }
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
        $('body').on('mouseout', '.fa-info-circle', dismissSeriesPopover);
        $('body').on('mouseover', '.fa-info-circle', setUpSeriesPopover);
    };

    addBinding();
});
