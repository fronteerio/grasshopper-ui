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

define(['gh.api.series', 'gh.api.util', 'gh.admin-constants'], function(seriesAPI, utilAPI, adminConstants) {

    /**
     * Load the information on the series and events in the series before initialising
     * the batch edit page
     */
    var loadSeriesEvents = function() {
        var seriesId = parseInt($.bbq.getState()['series'], 10);

        // Get the information about the series
        seriesAPI.getSeries(seriesId, function(err, series) {
            // Get the information about the events in the series
            seriesAPI.getSeriesEvents(seriesId, 100, 0, false, function(err, events) {
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
        $(document).on('gh.batchedit.setup', loadSeriesEvents);
    };

    addBinding();
});
