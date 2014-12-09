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

define(['gh.core', 'bootstrap.calendar', 'bootstrap.listview', 'chosen'], function(gh) {

    var triposData = {
        'courses': [],
        'subjects': [],
        'parts': [],
        'modules': []
    };


    /////////////////
    //  RENDERING  //
    /////////////////

    /**
     * Render the header
     */
    var renderHeader = function() {
        gh.api.utilAPI.renderTemplate($('#gh-header-template'), {
            'gh': gh
        }, $('#gh-header'));
    };

    /**
     * Render the calendar view
     */
    var setUpCalendar = function() {
        gh.api.utilAPI.renderTemplate($('#gh-calendar-template'), {
            'data': null
        }, $('#gh-main'));

        if (!gh.data.me) {
            $(document).trigger('gh.calendar.init');
        } else {
            gh.api.seriesAPI.getSeriesCalendar(1, '2014-01-12', '2014-12-12', function(err, data) {
                $(document).trigger('gh.calendar.init', {
                    'events': data.results
                });
            });
        }
    };

    /**
     * Set up the modules of events in the sidebar
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected part to fetch modules for
     */
    var setUpModules = function(ev, data) {
        var partId = parseInt(data.selected, 10);

        gh.api.orgunitAPI.getOrgUnits(gh.data.me.AppId, true, partId, ['module'], function(err, data) {
            // Sort the data before displaying it
            data.results.sort(sortByDisplayName);
            $.each(data.results, function(i, module) {
                module.Series.sort(sortByDisplayName);
            });

            // Render the series in the sidebar
            gh.api.utilAPI.renderTemplate($('#gh-modules-template'), {
                'data': data.results
            }, $('#gh-modules-container'));
        });
    };

    /**
     * Set up the part picker in the subheader
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected tripos to fetch parts for
     */
    var setUpPartPicker = function(ev, data) {
        // Get the parts associated to the selected tripos
        var parts = _.filter(triposData.parts, function(part) {
            return parseInt(data.selected, 10) === part.ParentId;
        });
        // Render the results in the part picker
        gh.api.utilAPI.renderTemplate($('#gh-subheader-part-template'), {
            'data': parts
        }, $('#gh-subheader-part'));

        // Show the subheader part picker
        $('#gh-subheader-part').show();

        // Destroy the field if it's been initialised previously
        $('#gh-subheader-part').chosen('destroy');
        // Initialise the Chosen plugin on the part picker
        $('#gh-subheader-part').chosen({
            'no_results_text': 'No matches for',
            'disable_search_threshold': 10
        }).change(setUpModules);
    };

    /**
     * Set up the Tripos picker in the subheader
     */
    var setUpTriposPicker = function() {
        var triposPickerData = {
            'courses': triposData.courses
        };

        _.each(triposPickerData.courses, function(course) {
            course.subjects = _.filter(triposData.subjects, function(subject) {
                return course.id === subject.ParentId;
            });
        });

        // Massage the data so that courses are linked to their child subjects
        // Render the results in the tripos picker
        gh.api.utilAPI.renderTemplate($('#gh-subheader-picker-template'), {
            'data': triposPickerData
        }, $('#gh-subheader-tripos'));

        // Show the subheader tripos picker
        $('#gh-subheader-tripos').show();

        // Initialise the Chosen plugin on the tripos picker
        $('#gh-subheader-tripos').chosen({
            'no_results_text': 'No matches for'
        }).change(setUpPartPicker);

        // Show the descriptive text on the left hand side
        $('#gh-content-description p').show();
    };

    /**
     * Get the tripos structure from the REST API and filter it down for easy
     * access in the templates
     */
    var getTripos = function() {
        var appId = gh.data.me && gh.data.me.AppId ? gh.data.me.AppId : null;
        gh.api.orgunitAPI.getOrgUnits(appId, false, null, ['course', 'subject', 'part'], function(err, data) {
            triposData.courses = _.filter(data.results, function(course) {
                return course.type === 'course';
            });

            triposData.subjects = _.filter(data.results, function(subject) {
                return subject.type === 'subject';
            });

            triposData.parts = _.filter(data.results, function(part) {
                return part.type === 'part';
            });

            // Sort the data before displaying it
            triposData.courses.sort(sortByDisplayName);
            triposData.subjects.sort(sortByDisplayName);
            triposData.parts.sort(sortByDisplayName);

            // Set up the tripos picker after all data has been retrieved
            setUpTriposPicker();
        });
    };


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Log in using the local authentication strategy
     *
     * @return {Boolean}     Return false to avoid default form behaviour
     */
    var doLogin = function() {
        var formValues = _.object(_.map($(this).serializeArray(), _.values));
        gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
            if (!err) {
                window.location = '/';
            } else {
                // Show an error to the user
            }
        });

        return false;
    };

    /**
     * Sort given objects based on the displayName property.
     * The list will be ordered from A to Z.
     *
     * @see Array#sort
     */
    var sortByDisplayName = function(a, b) {
        if (a.displayName.toLowerCase() < b.displayName.toLowerCase()){
            return -1;
        } else if (a.displayName.toLowerCase() > b.displayName.toLowerCase()) {
            return 1;
        }
        return 0;
    };


    //////////////////////
    //  INITIALISATION  //
    //////////////////////

    /**
     * Add bindings to various elements on the page
     */
    var addBinding = function() {
        $('body').on('submit', '#gh-signin-form', doLogin);

        $(document).on('gh.calendar.ready', function() {
            setUpCalendar();
        });
    };

    /**
     * Initialise the page
     */
    var initIndex = function() {
        addBinding();
        renderHeader();
        setUpCalendar();

        // If the user isn't logged in, the page shouldn't be fully initialised
        getTripos();
    };

    initIndex();
});
