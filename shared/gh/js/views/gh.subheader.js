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

define(['gh.core', 'gh.constants', 'gh.api.orgunit', 'gh.visibility', 'chosen'], function(gh, constants, orgunitAPI) {

    var triposData = null;

    // Cache the state
    var state = $.bbq.getState();

    /**
     * Set up the modules of events in the sidebar
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected part to fetch modules for
     * @private
     */
    var setUpModules = function(ev, data) {
        var partId = parseInt(data.selected, 10);

        // Push the selected tripos in the URL
        state['part'] = partId;
        $.bbq.pushState(state);

        // Track the part picker change in GA
        gh.utils.sendTrackingEvent('picker', 'change', 'part picker', partId);

        $(document).trigger('gh.listview.setup', {
            'partId': partId,
            'container': $('#gh-left-container')
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
        state['tripos'] = triposId;
        $.bbq.pushState(state);

        // Track the tripos picker change in GA
        gh.utils.sendTrackingEvent('picker', 'change', 'Tripos picker', triposId);

        // Get the parts associated to the selected tripos
        var parts = _.filter(triposData.parts, function(part) {
            // Only add the parts that are published for the normal users
            if (part.published || (!part.published && gh.data.me && gh.data.me.isAdmin)) {
                return parseInt(data.selected, 10) === part.ParentId;
            }
        });

        // Render the results in the part picker
        gh.utils.renderTemplate($('#gh-subheader-part-template'), {
            'data': {
                'gh': gh,
                'parts': parts
            }
        }, $('#gh-subheader-part'));

        // Show the subheader part picker
        $('#gh-subheader-part').show();

        // Destroy the field if it's been initialised previously
        $('#gh-subheader-part').chosen('destroy').off('change', setUpModules);

        // Initialise the Chosen plugin on the part picker
        $('#gh-subheader-part').chosen({
            'disable_search': true
        }).on('change', setUpModules);

        // Chosen has a bug where search sometimes isn't disabled properly
        $('#gh_subheader_part_chosen .chosen-search').hide();
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
        gh.utils.renderTemplate($('#gh-subheader-picker-template'), {
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

        // Set the default placeholder text
        $('#gh_subheader_tripos_chosen .chosen-search input').attr('placeholder', 'Search triposes');
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
            // If there is no selected tripos, the tripos, part, module and series should be removed from the hash
            $.bbq.removeState('tripos', 'part', 'module', 'series');
            // There is no state for the tripos, make sure it's reset
            setUpTriposPicker();
            // Show the contextual help
            if (!$('body').data('isadminui')) {
                $('#gh-content-description p').show();
            }
            // Resetting the tripos means destroying the part picker and hiding it
            if ($('#gh_subheader_part_chosen').length) {
                // Destroy the field if it's been initialised previously
                $('#gh-subheader-part').chosen('destroy').off('change', setUpModules);
                // Show the subheader part picker
                $('#gh-subheader-part').hide();
            }
        }

        state = $.bbq.getState() || {};
        // If the URL shows a preselected part, select that part automatically
        if (state.part && $('#gh-subheader-part [value="' + state.part + '"]').length) {
            $('#gh-subheader-part').val(state.part);
            $('#gh-subheader-part').trigger('change', {'selected': state.part});
            $('#gh-subheader-part').trigger('chosen:updated');
            // Hide the contextual help
            if (!$('body').data('isadminui')) {
                $('#gh-content-description p').hide();
            }

            // Dispatch an event to update the visibility button
            $(document).trigger('gh.part.changed', {'part': state.part});
        } else {
            // If there is no preselected part the part, module and series should be removed from the hash
            $.bbq.removeState('part', 'module', 'series');
            // Show the informational message to the user, if there is one
            gh.utils.renderTemplate($('#gh-tripos-help-template'), null, $('#gh-modules-list-container'));
            // Empty the modules container as nothing should be in there at the moment
            $('#gh-modules-container').empty();
            // Show the contextual help
            if (!$('body').data('isadminui')) {
                $('#gh-content-description p').show();
            }

            // Dispatch an event to update the visibility button
            $(document).trigger('gh.part.changed');
        }

        state = $.bbq.getState() || {};
        // ADMIN ONLY LOGIC
        if ($('body').data('isadminui')) {
            // If the URL shows a module and series, go into batch edit mode
            if (state.module && !_.isEmpty(state.module) && state.series && !_.isEmpty(state.series)) {
                // Set up batch edit, this will redirect the user to the correct batch edit view as well
                $(document).trigger('gh.batchedit.setup');
            } else {
                // If there is no preselected series, the module and series should be removed from the hash
                $.bbq.removeState('module', 'series');
                // Show the editable parts in the UI
                $(document).trigger('gh.admin.changeView', {'name': constants.views.EDITABLE_PARTS});
            }
        }
    };

    /**
     * Return to the home page
     *
     * @private
     */
    var goHome = function() {
        $.bbq.removeState();
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add bindings to various elements in the subheader component
     *
     * @private
     */
    var addBinding = function() {
        // Handle hash changes
        $(window).on('hashchange', handleHashChange);
        // Initialise the subheader component
        $(document).on('gh.subheader.init', function(ev, data) {
            triposData = data.triposData;
            // Set up the tripos picker
            setUpTriposPicker();
            // Run the hashchange logic to put the right selections in place
            handleHashChange();
        });

        $('body').on('click', '.gh-home', goHome);
    };

    addBinding();
});
