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

define(['gh.core', 'gh.constants', 'jquery.jeditable'], function(gh, constants) {

    /**
     * Add an organisational unit
     *
     * @private
     */
    var addOrgUnit = function() {
        // Get the form data
        var displayName = $('#gh-manage-orgunits-modal-text').val();
        var type = $('#gh-manage-orgunits-modal-type').val();
        var parentId = parseInt($('#gh-manage-orgunits-add-modal').attr('data-id'), 10) || null;

        // Create the organisational unit
        gh.api.orgunitAPI.createOrgUnit(gh.data.me.AppId, displayName, type, parentId, null, null, null, false, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not create the ' + type, constants.messaging.default.error, 'error');
            }

            // Show a notification
            var notification = _.template('<%- orgUnit %> was successfully created');
            notification = notification({'orgUnit': data.displayName});
            gh.utils.notification(notification, null, 'success');

            // Reload the organisational units
            $(document).trigger('gh.manage.orgunits.load');

            // Close the modal window
            $('#gh-manage-orgunits-add-modal').modal('hide');

            // Navigate to the created element
            scrollToOrgUnit('li[data-id="' + data.id + '"]');
        });

        // Prevent the form from being submitted
        return false;
    }

    /**
     * Delete an organisational unit
     *
     * @private
     */
    var deleteOrgUnit = function() {
        // Retrieve the organisational unit's id
        var orgUnitId = parseInt($('#gh-manage-orgunits-delete-modal').attr('data-id'), 10);
        var orgUnitType = $('#gh-manage-orgunits-delete-modal').attr('data-type');

        // Delete the organisational unit
        gh.api.orgunitAPI.deleteOrgUnit(orgUnitId, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not delete the ' + orgUnitType, constants.messaging.default.error, 'error');
            }

            // Show a notification
            gh.utils.notification('The ' + orgUnitType + ' was successfully deleted', null, 'success');

            // Close the modal window
            $('#gh-manage-orgunits-delete-modal').modal('hide');

            // Reload the organisational units
            $(document).trigger('gh.manage.orgunits.load');
        });
    };

    /**
     * Update the orginisational unit
     *
     * @param  {String}     value               The updated value
     * @param  {Object}     editableField       The editable field that triggered the change
     * @private
     */
    var updateOrgUnit = function(value, editableField) {

        // Get the parent of the jEditable form
        var $parent = $('.' + editableField.cssclass).closest('.gh-editable[data-id="' + editableField.id + '"]');

        // Don't submit the form if the value hasn't changed
        if ($parent.attr('data-value') === value) {
            return value;
        }

        // Get the id of the organisational unit
        var orgUnitId = parseInt($parent.attr('data-id'), 10);
        var orgUnitType = $parent.attr('data-type');

        // Update the organisational unit
        gh.api.orgunitAPI.updateOrgUnit(orgUnitId, null, value, null, null, null, null, null, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not update the ' + orgUnitType, constants.messaging.default.error, 'error');
            }

            // Display a success notification
            gh.utils.notification('The ' + orgUnitType + ' was successfully updated', null, 'success');

            // Reload the organisational units
            $(document).trigger('gh.manage.orgunits.load');

            // Navigate to the updated element
            setTimeout(function() {
                scrollToOrgUnit('li[data-id="' + data.id + '"]');
            }, 250);

            return data;
        });

        return value;
    };

    /**
     * Setup and show the add modal window
     *
     * @private
     */
    var setupAndShowAddModal = function() {
        var orgUnitId = $(this).attr('data-id');
        var orgUnitType = $(this).attr('data-type');
        var groupId = $(this).attr('data-groupid');

        // Render the add organisational unit modal
        gh.utils.renderTemplate('admin-manage-orgunits-add-modal', {
            'data': {
                'gh': gh,
                'data': {
                    'orgUnitId': orgUnitId,
                    'orgUnitType': orgUnitType
                }
            }
        }, $('#gh-modal'), function() {
            // Show the login modal
            $('#gh-manage-orgunits-add-modal').modal();
        });
    };

    /**
     * Setup and show the delete modal window
     *
     * @private
     */
    var setupAndShowDeleteModal = function() {
        var orgUnitId = $(this).attr('data-id');
        var orgUnitType = $(this).attr('data-type');

        // Render the add organisational unit modal
        gh.utils.renderTemplate('admin-manage-orgunits-delete-modal', {
            'data': {
                'gh': gh,
                'data': {
                    'orgUnitId': orgUnitId,
                    'orgUnitType': orgUnitType
                }
            }
        }, $('#gh-modal'), function() {
            // Show the login modal
            $('#gh-manage-orgunits-delete-modal').modal();
        });
    };

    /**
     * Scroll to a specific component on the page
     *
     * @param  {String}     anchor      The anchor to scroll to
     * @private
     */
    var scrollToOrgUnit = function(anchor) {
        $(anchor).onAvailable(function() {
            $('html, body').stop().animate({
                'scrollTop': ($(anchor).offset().top - 40)
            }, 750);
        });
    };

    /**
     * Setup the jEditable fields
     *
     * @private
     */
    var setupJEditable = function() {
        $('.gh-editable').onAvailable(function() {
            var editableFields = $('.gh-editable');
            _.each(editableFields, function(editableField) {
                var id = $(editableField).attr('data-id');
                $(editableField).editable(updateOrgUnit, {
                    'cssclass': 'gh-editable-editing',
                    'disable': false,
                    'height': '38px',
                    'maxlength': 255,
                    'id': id,
                    'onblur': 'submit',
                    'placeholder': 'Add a display name',
                    'callback': function(value, settings) {
                        $(editableField).closest('.gh-editable').attr('data-value', value);
                    }
                });
            });
        });
    };

    /**
     * Update the width of the editable field when typing
     *
     * @private
     */
    var updateEditableField = function() {
        var length = ($(this).find('input').val().length * 12) + 'px';
        $(this).find('input').css({'width': length});
    };

    /**
     * Validate the form before creating an organisational unit
     *
     * @private
     */
    var validateForm = function() {
        var $inputField = $('#gh-manage-orgunits-modal-text');
        var isValid = ($inputField.val().trim().length === 0);
        $('#gh-manage-orgunits-add').prop('disabled', isValid);
    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    /**
     * Add event listeners to various components on the page
     *
     * @private
     */
    var addBinding = function() {
        $(document).on('gh.manage.orgunits.loaded', setupJEditable);
        // Update the width of the editable field when typing
        $('body').on('keyup', '.gh-editable-editing', updateEditableField);
        // Show the 'add an organisational unit' modal window
        $('body').on('click', '.gh-manage-orgunits-show-add-modal', setupAndShowAddModal);
        // show the 'delete the organisational unit' modal winodw
        $('body').on('click', '.gh-manage-orgunits-delete', setupAndShowDeleteModal);
        // Validate the form
        $('body').on('keyup', '#gh-manage-orgunits-modal-text', validateForm);
        // Confirm the delete
        $('body').on('click', '#gh-manage-orgunits-modal-delete', deleteOrgUnit);
        // Submit the form
        $('body').on('click', '#gh-manage-orgunits-add', addOrgUnit);
        $('body').on('submit', '#gh-manage-orgunits-modal-form', addOrgUnit);
    };

    addBinding();
});
