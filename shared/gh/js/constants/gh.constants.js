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

    var messaging = exports.messaging = {
        'default': {
            'error': 'This is a Timetable error, if you still see this after reloading a Timetable in your browser please contact <a href="mailto:help@timetable.cam.ac.uk" title="Contact support">support</a>'
        }
    };

    // Object of template names and paths needed to make the production build work
    var templates = exports.templates = {

        // GH global admin views
        'global-admin-administrators': '/shared/gh/partials/global-admin-administrators.html',
        'global-admin-app-user': '/shared/gh/partials/global-admin-app-user.html',
        'global-admin-configuration': '/shared/gh/partials/global-admin-configuration.html',
        'global-admin-navigation': '/shared/gh/partials/global-admin-navigation.html',
        'global-admin-tenants': '/shared/gh/partials/global-admin-tenants.html',
        'global-admin-users': '/shared/gh/partials/global-admin-users.html',

        // GH tenant admin views
        'admin-batch-edit-actions': '/shared/gh/partials/admin-batch-edit-actions.html',
        'admin-batch-edit-date': '/shared/gh/partials/admin-batch-edit-date.html',
        'admin-batch-edit-event-row': '/shared/gh/partials/admin-batch-edit-event-row.html',
        'admin-batch-edit-event-type': '/shared/gh/partials/admin-batch-edit-event-type.html',
        'admin-batch-edit-time-picker': '/shared/gh/partials/admin-batch-edit-time-picker.html',
        'admin-batch-edit': '/shared/gh/partials/admin-batch-edit.html',
        'admin-borrow-series-module-item': '/shared/gh/partials/admin-borrow-series-module-item.html',
        'admin-edit-date-field': '/shared/gh/partials/admin-edit-date-field.html',
        'admin-edit-dates': '/shared/gh/partials/admin-edit-dates.html',
        'admin-help': '/shared/gh/partials/admin-help.html',
        'admin-login-form': '/shared/gh/partials/admin-login-form.html',
        'admin-modules': '/shared/gh/partials/admin-modules.html',
        'admin-subheader-pickers': '/shared/gh/partials/admin-subheader-pickers.html',
        'admin-tripos-help': '/shared/gh/partials/admin-tripos-help.html',
        'admin-video': '/shared/gh/partials/admin-video.html',
        'borrow-series-modal': '/shared/gh/partials/borrow-series-modal.html',
        'delete-module-modal': '/shared/gh/partials/delete-module-modal.html',
        'delete-module-overview': '/shared/gh/partials/delete-module-overview.html',
        'delete-series-modal': '/shared/gh/partials/delete-series-modal.html',
        'editable-parts': '/shared/gh/partials/editable-parts.html',
        'new-module-modal': '/shared/gh/partials/new-module-modal.html',
        'new-series': '/shared/gh/partials/new-series.html',
        'rename-module-modal': '/shared/gh/partials/rename-module-modal.html',
        'tenant-admin-app-user-search': '/shared/gh/partials/tenant-admin-app-user-search.html',
        'tenant-admin-app-user': '/shared/gh/partials/tenant-admin-app-user.html',
        'tenant-admin-app': '/shared/gh/partials/tenant-admin-app.html',
        'tenant-admin-config': '/shared/gh/partials/tenant-admin-config.html',
        'tenant-admin-navigation': '/shared/gh/partials/tenant-admin-navigation.html',
        'visibility-button': '/shared/gh/partials/visibility-button.html',
        'visibility-modal': '/shared/gh/partials/visibility-modal.html',

        // GH student views
        'agenda-view': '/shared/gh/partials/agenda-view.html',
        'empty-timetable': '/shared/gh/partials/empty-timetable.html',
        'module-disabled-popover': '/shared/gh/partials/module-disabled-popover.html',
        'series-borrowed-published-popover': '/shared/gh/partials/series-borrowed-published-popover.html',
        'series-info-modal': '/shared/gh/partials/series-info-modal.html',
        'series-info': '/shared/gh/partials/series-info.html',
        'student-modules': '/shared/gh/partials/student-modules.html',

        // GH shared views
        'calendar': '/shared/gh/partials/calendar.html',
        'event': '/shared/gh/partials/event.html',
        'event-popover': '/shared/gh/partials/event-popover.html',
        'header': '/shared/gh/partials/header.html',
        'login-form': '/shared/gh/partials/login-form.html',
        'login-modal': '/shared/gh/partials/login-modal.html',
        'series-borrowed-popover': '/shared/gh/partials/series-borrowed-popover.html',
        'subheader-part': '/shared/gh/partials/subheader-part.html',
        'subheader-picker': '/shared/gh/partials/subheader-picker.html',
        'subheader-pickers': '/shared/gh/partials/subheader-pickers.html',

        // GH tests
        'qunit-basic-test': '/shared/gh/partials/qunit-basic-test.html',
        'qunit-partial-test': '/shared/gh/partials/qunit-partial-test.html'
    };

    // Time constants
    var time = exports.time = {

        // Store the shorthand names of the weekdays
        'DAYS': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'MONTHS': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

        // Keep track of number of milliseconds in a day, week and month for use in the calendar
        'PERIODS': {
            'day': 1000 * 60 * 60 * 24,
            'week': 1000 * 60 * 60 * 24 * 7,
            'month': 1000 * 60 * 60 * 24 * 7 * 30
        }
    };

    var video = exports.video = {
        'adminhowto': 'fmojPnWju54'
    };

    // The admin views
    var views = exports.views = {
        'BATCH_EDIT': 'batchEdit',
        'EDITABLE_PARTS': 'editableParts',
        'NEW_SERIES': 'newSeries'
    };
});
