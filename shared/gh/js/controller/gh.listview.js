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

define(['gh.api.util', 'gh.api.orgunit'], function(utilAPI, orgunitAPI) {

    /**
     * Set up the modules of events in the sidebar. Note that context-specific handling should be done
     * in the appropriate components
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected part to fetch modules for
     * @private
     */
    var setUpModules = function(ev, data) {
        // Retrieve the organisational unit information for the modules
        orgunitAPI.getOrgUnits(require('gh.core').data.me.AppId, true, data.partId, ['module'], function(err, modules) {
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


    /////////////
    // UTILITY //
    /////////////

    /**
     * Update the list's expanded status in the local storage
     *
     * @param  {Object[]}    items    Collection of list items
     * @private
     */
    var updateListExpandedStatus = function(items) {
        // Fetch and parse the collapse listIds from the local storage
        var expandedIds = utilAPI.localDataStorage().get('expanded') || [];

        _.each(items, function(item) {

            // Add the listId to the local storage if expanded
            if (item.expanded) {
                expandedIds.push(item.id);

            // Remove the listId from the local storage if not expanded
            } else {
                _.remove(expandedIds, function(listId) { return listId === item.id; });
            }
        });

        // Store the expanded listIds
        utilAPI.localDataStorage().store('expanded', _.uniq(_.compact(expandedIds)));
    };

    /**
     * Toggle a list item's children's visibility and update the icon classes
     *
     * @private
     */
    var toggleList = function() {
        // Toggle the child lists
        $(this).closest('.list-group-item').toggleClass('gh-list-group-item-open');
        // Toggle the caret class of the icon that was clicked
        $(this).find('i').toggleClass('fa-caret-right fa-caret-down');

        // Fetch the id's of the expanded list
        var expandedItems = $('#gh-modules-list > .list-group-item').map(function(index, module) {
            return {
                'id': $(module).attr('data-id'),
                'expanded': $(module).hasClass('gh-list-group-item-open')
            };
        });

        // Store the expanded list items
        updateListExpandedStatus(expandedItems);
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various listview elements
     *
     * @private
     */
    var addBinding = function() {
        // Toggle a list item
        $('body').on('click', '.gh-toggle-list', toggleList);
        // Set up the modules list
        $(document).on('gh.listview.setup', setUpModules);
        // Refresh the modules list
        $(document).on('gh.listview.refresh', setUpModules);
    };

    addBinding();
});
