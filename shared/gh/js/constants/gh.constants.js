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

define(['exports'], function(exports) {

    // The admin views
    var views = exports.views = {
        'BATCH_EDIT': 'batchEdit',
        'EDITABLE_PARTS': 'editableParts',
        'NEW_SERIES': 'newSeries'
    };

    // Time constants
    var time = exports.time = {

        // Store the shorthand names of the weekdays
        'DAYS': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'MONTHS': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

        // Keep track of number of milliseconds in a day, week and month for use in the calendar
        'PERIODS': {
            'hour': 1000 * 60 * 60,
            'day': 1000 * 60 * 60 * 24,
            'week': 1000 * 60 * 60 * 24 * 7,
            'month': 1000 * 60 * 60 * 24 * 7 * 30
        }
    };
});
