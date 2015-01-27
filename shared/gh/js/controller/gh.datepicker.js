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

define(['gh.core', 'clickover', 'jquery-datepicker'], function(gh) {


    ///////////////////
    //  DATE PICKER  //
    ///////////////////

    /**
     * Render the date picker
     *
     * @private
     */
    var renderDatePicker = function() {
        $('.popover #gh-datepicker').datepicker();
    };


    /////////////////
    //  CLICKOVER  //
    /////////////////

    /**
     * Dismiss the popover window
     *
     * @private
     */
    var dismissPopover = function() {
        // This will trigger a global close
        $('body').trigger('click');
    };

    /**
     * Show the popover window
     *
     * @private
     */
    var showPopover = function() {
        // Cache the trigger
        var $trigger = $(this);
        // Render the popover template
        var content = gh.api.utilAPI.renderTemplate($('#gh-datepicker-popover-template'), {'data': null});

        // Show the popover window
        _.defer(function() {
            var options = {
                'container': 'body',
                'content': content,
                'global_close': true,
                'html': true,
                'placement': 'bottom',
                'onShown': renderDatePicker
            };

            $trigger.clickover(options);
            $trigger.trigger('click');
        });
    };


    ///////////////
    //  BINDING  //
    ///////////////

    /**
     * Add handlers to various elements in the data picker popover
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('click', '#gh-edit-dates-cancel', dismissPopover);
        $('body').on('click', '.gh-event-date', showPopover);
    };

    addBinding();
});
