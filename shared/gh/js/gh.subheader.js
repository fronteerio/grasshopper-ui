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

define(['gh.api.util', 'gh.api.orgunit', 'chosen'], function(utilAPI, orgunitAPI) {

    var triposData = null;

    /**
     * Set up the modules of events in the sidebar
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected part to fetch modules for
     * @private
     */
    var setUpModules = function(ev, data) {

        // Hide the tripos help text
        $('.gh-tripos-help').hide();
        var partId = parseInt(data.selected, 10);

        // Push the selected tripos in the URL
        state['part'] = partId;
        $.bbq.pushState(state);

        // Track the part picker change in GA
        utilAPI.sendTrackingEvent('picker', 'change', 'part picker', partId);

        orgunitAPI.getOrgUnits(require('gh.core').data.me.AppId, true, partId, ['module'], function(err, modules) {
            if (err) {
                utilAPI.notification('Fetching modules failed.', 'An error occurred while fetching the modules.', 'error');
            }

            // Sort the data before displaying it
            modules.results.sort(utilAPI.sortByDisplayName);
            $.each(modules.results, function(i, module) {
                module.Series.sort(utilAPI.sortByDisplayName);
            });

            // Decorate the modules with their expanded status if LocalStorage is supported
            var expandedIds = [];
            if (Storage) {
                expandedIds = _.compact(utilAPI.localDataStorage().get('expanded'));
                _.each(modules.results, function(module) {
                    module.expanded = (_.indexOf(expandedIds, String(module.id)) > -1);
                });
            }

            // Render the series in the sidebar
            utilAPI.renderTemplate($('#gh-modules-template'), {
                'data': modules.results
            }, $('#gh-modules-container'));

            // Clear local storage
            utilAPI.localDataStorage().remove('expanded');

            // Add the current expanded module(s) back to the local storage
            collapsedIds = $('.gh-list-group-item-open').map(function(index, value) {
                return $(value).attr('data-id');
            });

            collapsedIds = _.map(collapsedIds, function(id) { return id; });
            utilAPI.localDataStorage().store('expanded', expandedIds);
        });
    };

    /**
     * Set up the part picker in the subheader
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected tripos to fetch parts for
     * @private
     */
    var setUpPartPicker = function(ev, data) {
        var triposId = parseInt(data.selected, 10);

        // Push the selected tripos in the URL
        state = {
            'tripos': triposId,
            'part': $.bbq.getState()['part']
        };
        $.bbq.pushState(state);

        // Track the tripos picker change in GA
        utilAPI.sendTrackingEvent('picker', 'change', 'Tripos picker', triposId);

        // Get the parts associated to the selected tripos
        var parts = _.filter(triposData.parts, function(part) {
            return parseInt(data.selected, 10) === part.ParentId;
        });

        // Render the results in the part picker
        utilAPI.renderTemplate($('#gh-subheader-part-template'), {
            'data': parts
        }, $('#gh-subheader-part'));

        // Show the subheader part picker
        $('#gh-subheader-part').show();

        // Destroy the field if it's been initialised previously
        $('#gh-subheader-part').chosen('destroy').off('change', setUpModules);

        // Initialise the Chosen plugin on the part picker
        $('#gh-subheader-part').chosen({
            'no_results_text': 'No matches for',
            'disable_search_threshold': 10
        }).on('change', setUpModules);
    };

    /**
     * Set up the Tripos picker in the subheader
     *
     * @private
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
        utilAPI.renderTemplate($('#gh-subheader-picker-template'), {
            'data': triposPickerData
        }, $('#gh-subheader-tripos'));

        // Show the subheader tripos picker
        $('#gh-subheader-tripos').show();

        // Destroy the field if it's been initialised previously
        $('#gh-subheader-tripos').chosen('destroy').off('change', setUpModules);

        // Initialise the Chosen plugin on the tripos picker
        $('#gh-subheader-tripos').chosen({
            'no_results_text': 'No matches for'
        }).change(setUpPartPicker);
    };

    /**
     * Handle the hashchange event by applying state values to the pickers. Can also be
     * used separate from the hashchange event to apply state values to the pickers
     *
     * @private
     */
    var handleHashChange = function() {
        state = $.bbq.getState() || {};

        // If the URL shows a preselected tripos, select that tripos automatically
        if (state.tripos && !_.isEmpty(state.tripos)) {
            $('#gh-subheader-tripos').val(state.tripos);
            $('#gh-subheader-tripos').trigger('change', {'selected': state.tripos});
            $('#gh-subheader-tripos').trigger('chosen:updated');
        } else {
            // There is no state for the tripos, make sure it's reset
            // Resetting the tripos means destroying the part picker and hiding it
            if ($('#gh_subheader_part_chosen').length) {
                // Destroy the field if it's been initialised previously
                $('#gh-subheader-part').chosen('destroy').off('change', setUpModules);
                // Show the subheader part picker
                $('#gh-subheader-part').hide();
            }
            // Reinitialise the tripos picker
            setUpTriposPicker();
        }

        // If the URL shows a preselected part, select that part automatically
        if (state.part && $('#gh-subheader-part [value="' + state.part + '"]').length) {
            $('#gh-subheader-part').val(state.part);
            $('#gh-subheader-part').trigger('change', {'selected': state.part});
            $('#gh-subheader-part').trigger('chosen:updated');
        } else {
            // Remove any modules and event series from the sidebar when no part is selected
            // so no inaccurate information is presented to the user
            $('#gh-modules-container').empty();
        }
    };

    /**
     * Add bindings to various elements in the subheader component
     */
    var addBinding = function() {
        // Handle hash changes
        $(window).on('hashchange', handleHashChange);
        // Initialise the subheader component
        $(document).on('gh.subheader.init', function(ev, data) {
            triposData = data.triposData;

            // Add event handlers to various elements
            addBinding();
            // Set up the tripos picker
            setUpTriposPicker();
            // Run the hashchange logic to put the right selections in place
            handleHashChange();
        });
    };

    addBinding();
});
