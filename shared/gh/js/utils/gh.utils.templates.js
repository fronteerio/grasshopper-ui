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
            'text!gh/partials/admin-batch-edit.html',
            'text!gh/partials/admin-batch-edit-actions.html',
            'text!gh/partials/admin-batch-edit-date.html',
            'text!gh/partials/admin-batch-edit-event-row.html',
            'text!gh/partials/admin-batch-edit-event-type.html',
            'text!gh/partials/admin-batch-edit-time-picker.html',
            'text!gh/partials/admin-borrow-series-module-item.html',
            'text!gh/partials/admin-edit-date-field.html',
            'text!gh/partials/admin-edit-dates.html',
            'text!gh/partials/admin-header-template.html',
            'text!gh/partials/admin-module-item.html',
            'text!gh/partials/admin-modules.html',
            'text!gh/partials/borrow-series-modal.html',
            'text!gh/partials/calendar.html',
            'text!gh/partials/delete-module-modal.html',
            'text!gh/partials/delete-module-overview.html',
            'text!gh/partials/delete-series-modal.html',
            'text!gh/partials/editable-parts.html',
            'text!gh/partials/empty-timetable.html',
            'text!gh/partials/event.html',
            'text!gh/partials/event-popover.html',
            'text!gh/partials/login-form.html',
            'text!gh/partials/login-modal.html',
            'text!gh/partials/header-template.html',
            'text!gh/partials/new-module-modal.html',
            'text!gh/partials/new-series.html',
            'text!gh/partials/rename-module-modal.html',
            'text!gh/partials/series-borrowed-popover.html',
            'text!gh/partials/series-borrowed-published-popover.html',
            'text!gh/partials/series-info.html',
            'text!gh/partials/series-info-popover.html',
            'text!gh/partials/student-module-item.html',
            'text!gh/partials/student-modules.html',
            'text!gh/partials/subheader-part.html',
            'text!gh/partials/subheader-picker.html',
            'text!gh/partials/subheader-pickers.html',
            'text!gh/partials/visibility-button.html',
            'text!gh/partials/visibility-modal.html'
        ];

        // Require all the partial HTML files
        require(deps, function() {
            _.each(arguments, function(arg, index) {
                var partial = deps[index];

                // Use the filename as the name of the partial
                partial = partial.replace(/text\!gh\/partials\//, '');
                partial = partial.replace(/\.html/, '');

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
});
