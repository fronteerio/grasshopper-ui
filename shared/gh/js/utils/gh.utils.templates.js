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

define(['exports', 'gh.constants'], function(exports, constants) {

    /**
     * Add support for partials in Lodash. `_.mixin` allows us to extend underscore with
     * custom functions that are available in every template. By running
     * `_.partial('name', data, renderAtStart)` in a template the partial can be accessed.
     * The name corresponds to the name given when declaring the partial. The data should be an
     * object containing values used in the partial. `renderAtStart` should be set to false if
     * the partial is called from inside another partial and should be rendered via a
     * JavaScript call after the wrapping partial has been rendered.
     *
     * @param  {Function}    callback    Standard callback function
     */
    var cachePartials = exports.cachePartials = function(callback) {
        // Used to cache the partials
        var partialCache = {};

        // Add our own functions to lodash to declare and access partials
        _.mixin({
            'declarePartial': function(name, template) {
                partialCache[name] = _.template(template);
            },
            'partial': function(name, data, renderAtStart) {
                // TODO: replace `renderStart` with a more robust solution for delayed rendering
                //       of partials inside of partials
                /* istanbul ignore if */
                if (renderAtStart === false) {
                    return '<%= _.partial("' + name + '", {data: data}, null) %>';
                }
                return partialCache[name](data);
            }
        });

        // The collection of templates
        var deps = [
            'text!/shared/gh/partials/admin-batch-edit.html',
            'text!/shared/gh/partials/admin-batch-edit-actions.html',
            'text!/shared/gh/partials/admin-batch-edit-date.html',
            'text!/shared/gh/partials/admin-batch-edit-event-row.html',
            'text!/shared/gh/partials/admin-batch-edit-event-type.html',
            'text!/shared/gh/partials/admin-batch-edit-time-picker.html',
            'text!/shared/gh/partials/admin-borrow-series-module-item.html',
            'text!/shared/gh/partials/admin-edit-date-field.html',
            'text!/shared/gh/partials/admin-edit-dates.html',
            'text!/shared/gh/partials/admin-header-template.html',
            'text!/shared/gh/partials/admin-module-item.html',
            'text!/shared/gh/partials/admin-modules.html',
            'text!/shared/gh/partials/agenda-view.html',
            'text!/shared/gh/partials/borrow-series-modal.html',
            'text!/shared/gh/partials/calendar.html',
            'text!/shared/gh/partials/delete-module-modal.html',
            'text!/shared/gh/partials/delete-module-overview.html',
            'text!/shared/gh/partials/delete-series-modal.html',
            'text!/shared/gh/partials/editable-parts.html',
            'text!/shared/gh/partials/empty-timetable.html',
            'text!/shared/gh/partials/event.html',
            'text!/shared/gh/partials/event-popover.html',
            'text!/shared/gh/partials/login-form.html',
            'text!/shared/gh/partials/login-modal.html',
            'text!/shared/gh/partials/header-template.html',
            'text!/shared/gh/partials/new-module-modal.html',
            'text!/shared/gh/partials/new-series.html',
            'text!/shared/gh/partials/rename-module-modal.html',
            'text!/shared/gh/partials/series-borrowed-popover.html',
            'text!/shared/gh/partials/series-borrowed-published-popover.html',
            'text!/shared/gh/partials/series-info.html',
            'text!/shared/gh/partials/series-info-modal.html',
            'text!/shared/gh/partials/student-module-item.html',
            'text!/shared/gh/partials/student-modules.html',
            'text!/shared/gh/partials/subheader-part.html',
            'text!/shared/gh/partials/subheader-picker.html',
            'text!/shared/gh/partials/subheader-pickers.html',
            'text!/shared/gh/partials/visibility-button.html',
            'text!/shared/gh/partials/visibility-modal.html'
        ];

        // Require all the partial HTML files
        require(deps, function() {
            _.each(arguments, function(arg, index) {
                var partial = deps[index];

                // Use the filename as the name of the partial
                partial = partial.replace(/text\!\/shared\/gh\/partials\//, '');
                partial = partial.replace(/\.html/, '');
                partial = partial.split('.')[0];

                // Create a partial for each template
                _.declarePartial(partial, arg);
            });

            callback();
        });
    };

    /**
     * Render a template and either return the HTML or populate a target container with the result
     *
     * @param  {Element|String}    $template    jQuery element representing the HTML element that contains the template or jQuery selector for the template container
     * @param  {Object}            [data]       JSON object representing the values used to process the template
     * @param  {Element|String}    [$target]    jQuery element representing the HTML element in which the template output should be put, or jQuery selector for the output container
     * @return {String}                         The rendered HTML
     * @throws {Error}                          Error thrown when no template has been provided
     */
    var renderTemplate = exports.renderTemplate = function($template, data, $target) {
        if (!$template) {
            throw new Error('No valid template has been provided');
        }

        // Make sure we're dealing with jQuery objects
        $template = $($template);
        $target = $($target);

        data = data || {};

        // Compile the template
        var compiled = _.template($template.text());
        compiled = compiled(data);

        // If a target container was specified, render the HTML into it
        if ($target.length) {
            $target.html(compiled);
        }

        // Always return the rendered HTML string
        return compiled;
    };

    /**
     * Render and return the hierarchy string
     *
     * @param  {Object}    orgUnit      The organisational unit to start building the hierarchy structure with
     * @param  {String}    separator    The string used to split the organisational units
     * @return {String}                 The generated hierarchy string
     */
    var renderHierarchyString = exports.renderHierarchyString = function(orgUnit, separator) {
        if (!_.isObject(orgUnit)) {
            throw new Error('An invalid value for orgUnit has been provided');
        } else if (!_.isString(separator)) {
            throw new Error('An invalid value for separator has been provided');
        }

        // Store the organisational units' display names
        var hierarchy = [];

        /**
         * Retrieve the display name for each parent object in the tree structure and return
         * the hierarchy string when no more parents are available
         *
         * @param  {Object}             The organisational unit to return the display name from
         * @return {Function|String}    The recursive function or the generated hierarchy string
         * @private
         */
        var _renderHierarchyString = function(orgUnit) {
            hierarchy.push('<span>' + orgUnit.displayName + '</span>');
            if (orgUnit.Parent) {
                return _renderHierarchyString(orgUnit.Parent);
            } else {
                return hierarchy.reverse().join(separator);
            }
        };

        // Start rendering the hierarchy string
        return _renderHierarchyString(orgUnit);
     };
});
