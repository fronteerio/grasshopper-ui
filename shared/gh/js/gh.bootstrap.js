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

/*!
 * Initalize requireJS by setting paths and specifying load priorities
 */
requirejs.config({
    'baseUrl': '/shared/',
    'paths': {
        // jQuery module is managed by require-jquery variation of require.js
        'jquery': 'empty:',

        // Vendor paths
        'bootstrap': 'vendor/js/bootstrap',
        'bootstrap-notify': 'vendor/js/bootstrap-notify',
        'chosen': 'vendor/js/chosen.jquery',
        'clickover': 'vendor/js/bootstrapx-clickover',
        'fullcalendar': 'vendor/js/fullcalendar',
        'jquery-autosuggest': 'vendor/js/jquery.autosuggest',
        'jquery-datepicker': 'vendor/js/jquery-datepicker',
        'jquery-history': 'vendor/js/jquery.history',
        'jquery-ui': 'vendor/js/jquery-ui',
        'jquery.jeditable': 'vendor/js/jquery.jeditable',
        'jquery.placeholder': 'vendor/js/jquery.placeholder',
        'jquery.serializeobject': 'vendor/js/jquery.serializeobject',
        'lodash': 'vendor/js/lodash',
        'marked': 'vendor/js/marked',
        'moment': 'vendor/js/moment',
        'moment-timezone': 'vendor/js/moment-timezone',
        'sinon': 'vendor/js/sinon-1.12.1',
        'text': 'vendor/js/require.text',
        'validator': 'vendor/js/bootstrap-validator',

        // GH core
        'pluginBuilder': 'gh/pluginBuilder',
        'gh.bootstrap': 'gh/js/gh.bootstrap',
        'gh.core': 'gh/js/gh.core',

        // GH API controllers
        'gh.api': 'gh/js/controllers/gh.api',
        'gh.api.admin': 'gh/js/controllers/gh.api.admin',
        'gh.api.app': 'gh/js/controllers/gh.api.app',
        'gh.api.authentication': 'gh/js/controllers/gh.api.authentication',
        'gh.api.config': 'gh/js/controllers/gh.api.config',
        'gh.api.event': 'gh/js/controllers/gh.api.event',
        'gh.api.groups': 'gh/js/controllers/gh.api.groups',
        'gh.api.orgunit': 'gh/js/controllers/gh.api.orgunit',
        'gh.api.series': 'gh/js/controllers/gh.api.series',
        'gh.api.tenant': 'gh/js/controllers/gh.api.tenant',
        'gh.api.tests': 'gh/js/controllers/gh.api.tests',
        'gh.api.user': 'gh/js/controllers/gh.api.user',

        // GH constants
        'gh.constants': 'gh/js/constants/gh.constants',

        // GH utilities
        'gh.utils': 'gh/js/utils/gh.utils',
        'gh.utils.instrumentation': 'gh/js/utils/gh.utils.instrumentation',
        'gh.utils.orgunits': 'gh/js/utils/gh.utils.orgunits',
        'gh.utils.state': 'gh/js/utils/gh.utils.state',
        'gh.utils.templates': 'gh/js/utils/gh.utils.templates',
        'gh.utils.time': 'gh/js/utils/gh.utils.time',

        // GH global admin view controllers
        'gh.global-admin.configuration': 'gh/js/views/global-admin/gh.configuration',
        'gh.global-admin.tenants': 'gh/js/views/global-admin/gh.tenants',
        'gh.global-admin.users': 'gh/js/views/global-admin/gh.users',

        // GH tenant admin view controllers
        'gh.admin.batch-edit': 'gh/js/views/tenant-admin/gh.admin-batch-edit',
        'gh.admin.batch-edit-date': 'gh/js/views/tenant-admin/gh.admin-batch-edit-date',
        'gh.admin.batch-edit-organiser': 'gh/js/views/tenant-admin/gh.admin-batch-edit-organiser',
        'gh.admin.borrow-series': 'gh/js/views/tenant-admin/gh.borrow-series',
        'gh.admin.datepicker': 'gh/js/views/tenant-admin/gh.datepicker',
        'gh.admin.delete-module': 'gh/js/views/tenant-admin/gh.delete-module',
        'gh.admin.delete-series': 'gh/js/views/tenant-admin/gh.delete-series',
        'gh.admin.edit-organiser': 'gh/js/views/tenant-admin/gh.admin-edit-organiser',
        'gh.admin.event-type-select': 'gh/js/views/tenant-admin/gh.admin-event-type-select',
        'gh.admin.listview': 'gh/js/views/tenant-admin/gh.admin-listview',
        'gh.admin.manage-orgunits': 'gh/js/views/tenant-admin/gh.admin-manage-orgunits',
        'gh.admin.new-module': 'gh/js/views/tenant-admin/gh.new-module',
        'gh.admin.new-series': 'gh/js/views/tenant-admin/gh.new-series',
        'gh.admin.rename-module': 'gh/js/views/tenant-admin/gh.rename-module',
        'gh.admin.series-title': 'gh/js/views/tenant-admin/gh.admin-series-title',
        'gh.admin.video': 'gh/js/views/tenant-admin/gh.video',
        'gh.admin.visibility': 'gh/js/views/tenant-admin/gh.visibility',

        // GH student view controllers
        'gh.student.agenda-view': 'gh/js/views/tenant-student/gh.agendaview',
        'gh.student.listview': 'gh/js/views/tenant-student/gh.listview',
        'gh.student.login-modal': 'gh/js/views/tenant-student/gh.login-modal',
        'gh.student.module-borrowed': 'gh/js/views/tenant-student/gh.module-borrowed-popover',
        'gh.student.series-info': 'gh/js/views/tenant-student/gh.series-info',
        'gh.student.series-borrowed-published-popover': 'gh/js/views/tenant-student/gh.series-borrowed-published-popover',
        'gh.student.terms-and-conditions': 'gh/js/views/tenant-student/gh.terms-and-conditions',

        // GH shared view controllers
        'gh.calendar': 'gh/js/views/gh.calendar',
        'gh.footer': 'gh/js/views/gh.footer',
        'gh.header': 'gh/js/views/gh.header',
        'gh.listview': 'gh/js/views/gh.listview',
        'gh.login-form': 'gh/js/views/gh.login-form',
        'gh.series-borrowed-popover': 'gh/js/views/gh.series-borrowed-popover',
        'gh.subheader': 'gh/js/views/gh.subheader'
    },
    'priority': ['jquery', 'lodash'],
    'shim' : {
        'bootstrap' : {
            'deps': ['jquery', 'fullcalendar'],
            'exports': 'bootstrap'
        },
        'fullcalendar': {
            'deps': ['jquery', 'moment']
        },
        'jquery-ui': {
            'deps': ['jquery']
        },
        'jquery-datepicker': {
            'deps': ['jquery-ui']
        },
        'jquery.placeholder': {
            'deps': ['jquery']
        },
        'admin-event-type-select': {
            'deps': ['jquery.jeditable']
        }
    },
    'waitSeconds': 30
});

/*!
 * Load all of the dependencies and core GH APIs
 */
require(['gh.core'], function() {
    // Find the script that has specified both the data-main (which loaded this bootstrap script) and a data-loadmodule attribute. The
    // data-loadmodule attribute tells us which script they wish to load *after* the core APIs have been properly bootstrapped.
    var $mainScript = $('script[data-main][data-loadmodule]');
    /* istanbul ignore else */
    if ($mainScript.length > 0) {
        var loadModule = $mainScript.attr('data-loadmodule');
        /* istanbul ignore else */
        if (loadModule) {
            // Require the module they specified in the data-loadmodule attribute
            require([loadModule]);
        }
    }
});
