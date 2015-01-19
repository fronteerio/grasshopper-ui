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

define(['gh.api.util'], function(utilAPI) {


    /////////////
    // UTILITY //
    /////////////

    /**
     * Update the list's collapsed status in the local storage
     *
     * @param  {Number}     id           The id of the list
     * @param  {Boolean}    collapsed    Whether or not the list is collapsed
     * @private
     */
    var updateListCollapsedStatus = function(id, collapsed) {
        // Fetch and parse the collapse listIds from the local storage
        var collapsedIds = utilAPI.localDataStorage().get('collapsed') || [];

        // Add the listId to the local storage if collapsed
        if (collapsed) {
            collapsedIds.push(id);

        // Remove the listId from the local storage if not collapsed
        } else {
            _.remove(collapsedIds, function(listId) { return listId === id; });
        }

        // Store the collapsed listIds
        utilAPI.localDataStorage().store('collapsed', _.compact(collapsedIds));
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Toggle a list item's children's visibility and update the icon classes
     */
    $('body').on('click', '.gh-toggle-list', function() {
        // Toggle the child lists
        $(this).closest('.list-group-item').toggleClass('gh-list-group-item-open');
        // Toggle the caret class of the icon that was clicked
        $(this).find('i').toggleClass('fa-caret-right fa-caret-down');
        // Update the list's collapsed status in the local storage
        updateListCollapsedStatus($(this).closest('.list-group-item').attr('data-id'), $(this).closest('.list-group-item').hasClass('gh-list-group-item-open'));
    });
});