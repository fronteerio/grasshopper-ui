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
     * `_.partial('name', [data], [renderAtStart], [htmlTarget])` in a template the partial can be accessed.
     * The name corresponds to the name given when declaring the partial. The data should be an
     * object containing values used in the partial. `renderAtStart` should be set to false if
     * the partial is called from inside another partial and should be rendered via a
     * JavaScript call after the wrapping partial has been rendered. `htmlTarget` specifies
     * a target container to render the partial in. This can be used when a partial within another
     * partial is rendered.
     */
    var cachePartials = exports.cachePartials = function(callback) {

        // Used to cache the partials
        var partialCache = {};

        // Add our own functions to lodash to declare and access partials
        _.mixin({

            /**
             * Cache a partial into the partialCache object for later use
             *
             * @param  {String}    name        The name of the partial
             * @param  {String}    template    The corresponding partial template
             */
            'cachePartial': function(name, template) {
                partialCache[name] = _.template(template);
            },

            /**
             * Render a partial
             *
             * @param  {String}           name               The name of the partial to render. This is the filename minus the `.html` extension
             * @param  {Object}           [data]             The data object to render the partial with
             * @param  {Boolean}          [renderAtStart]    Whether or not to render the partial straight away
             * @param  {String}           [htmlTarget]       Target container selector to replace with the partial. Useful for rendering partials that are part of another partial and can't be synchronously rendered
             * @return {Promise|String}                      Returns a Promise when the partial wasn't cached yet, returns a rendered template String when it was previously cached and immediately accessible
             */
            'partial': function(name, data, renderAtStart, htmlTarget) {
                // Set up a promise
                var dfd = $.Deferred();

                /**
                 * Resolve the promise by either returning or rendering the partial
                 *
                 * @private
                 */
                var resolvePartial = function() {
                    // If a target container was specified, wait until it's available in the DOM and then replace it with the rendered HTML
                    if (htmlTarget) {
                        $(htmlTarget).onAvailable(function() {
                            // Populate the container with the rendered template
                            $(htmlTarget).replaceWith(partialCache[name](data));
                            // Resolve the promise
                            return dfd.resolve(partialCache[name](data));
                        });
                    // If no target container was specified, only return the rendered HTML by resolving the promise
                    } else {
                        // Resolve the promise
                        return dfd.resolve(partialCache[name](data));
                    }
                };

                // Return a cached partial straight away
                if (partialCache[name]) {
                    return resolvePartial();
                }

                // If the template wasn't defined in the constants we throw an error
                if (!constants.templates[name]) {
                    throw new Error('An unspecified template has been requested. Template \'' + name + '\' cannot be found.');
                }

                // If the requested partial wasn't cached yet, require the file and render or return the template
                require(['text!' + constants.templates[name]], function(template) {
                    /* istanbul ignore if */
                    if (renderAtStart === false) {
                        return '<%= _.partial("' + name + '", {data: data}, null) %>';
                    }

                    // Add the partial to the cache
                    _.cachePartial(name, template);

                    // Return or render the partial HTML
                    return resolvePartial();
                });

                // Return the promise
                return dfd.promise();
            }
        });

        // Collection of partials that can't be conveniently lazy-loaded
        var preLoadPartials = [
            'text!' + constants.templates['event'] // The `event` partial cannot be lazy-loaded as the calendar requires it immediately in the return of its logic
        ];

        // Preload the partials and declare them
        require(preLoadPartials, function(evPartial) {
            _.each(arguments, function(template, index) {
                var partial = preLoadPartials[index];

                // Use the filename as the name of the partial
                partial = partial.replace(/text\!\/shared\/gh\/partials\//, '');
                partial = partial.replace(/\.html/, '');
                partial = partial.split('.')[0];

                // Cache the partial template
                _.cachePartial(partial, template);
            });

            // Execute the callback to continue the startup sequence
            callback();
        });
    };

    /**
     * Render a template and either return the HTML or populate a target container with the result
     *
     * @param  {String}            partial                    The name of the partial to render
     * @param  {Object}            [data]                     JSON object representing the values used to process the template
     * @param  {Element|String}    [$target]                  jQuery element representing the HTML element in which the template output should be put, or jQuery selector for the output container
     * @param  {Function}          [callback]                 Optional callback to execute after the partial has been retrieved and rendered
     * @param  {String}            [callback.renderedHTML]    The rendered HTML String
     * @return {String}                                       The rendered HTML String
     * @throws {Error}                                        Error thrown when no template has been provided
     */
    var renderTemplate = exports.renderTemplate = function(partial, data, $target, callback) {
        if (!_.isString(partial)) {
            throw new Error('No valid partial name has been provided');
        } else if (data && !_.isObject(data)) {
            throw new Error('No valid data object has been provided');
        } else if ($target && (!_.isObject($target) && !_.isString($target))) {
            throw new Error('No valid target object or string has been provided');
        }

        // Make sure we're dealing with jQuery objects for the target container
        $target = $($target);

        // Default the template data to an empty object if none was provided
        data = data || {};

        // Initialise the renderedHTML template variable
        var renderedHTML = '';

        // Get the partial from cache or lazy load it before compiling it
        _.partial(partial, data).done(function(_template) {
            renderedHTML = _.template(_template)(data);

            // If a target container was specified, render the HTML into it
            if ($target.length) {
                $target.html(renderedHTML);
            }

            if (callback && _.isFunction(callback)) {
                return callback(renderedHTML);
            }
        });

        // Always return the rendered HTML string
        return renderedHTML;
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
