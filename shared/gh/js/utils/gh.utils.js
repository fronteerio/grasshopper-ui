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

define(['exports', 'gh.utils.instrumentation', 'gh.utils.orgunits', 'gh.utils.state', 'gh.utils.templates', 'gh.utils.time', 'bootstrap-notify'], function(exports, instrumentation, orgunits, state, templates, time) {


    ///////////////
    //  GENERAL  //
    ///////////////

    /**
     * Set the title of the document. Depending on the interface that's loaded up, the title will be prefixed with:
     *     - 'My Timetable' when the student UI is loaded
     *     - 'Timetable Administration' when the administrator UI is loaded
     *
     * @param {String}    [title]    The title to set to the document
     * @throws {Error}               A parameter validation error
     */
    var setDocumentTitle = exports.setDocumentTitle = function(title) {
        if (title && !_.isString(title)) {
            throw new Error('An invalid value for title was provided');
        }

        // Default the previx to 'My Timetable'. If the admin UI is loaded
        // up the prefix should be 'Timetable Administration'
        var prefix = 'My Timetable ';
        /* istanbul ignore next */
        if ($('body').hasClass('gh-admin')) {
            prefix = 'Timetable Administration ';
        }

        document.title = prefix + title.trim();
    };

    /**
     * Generates a random 10 character sequence of upper and lowercase letters.
     *
     * @param  {Boolean}    toLowerCase    Whether or not the string should be returned lowercase
     * @return {String}                    Random 10 character sequence of upper and lowercase letters
     * @throws {Error}                     A parameter validation error
     */
    var generateRandomString = exports.generateRandomString = function(toLowerCase) {
        if (toLowerCase && !_.isBoolean(toLowerCase)) {
            throw new Error('An invalid value for toLowerCase has been provided');
        }

        // Generate a random string
        var rndString = _.sample('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10).join('');
        if (toLowerCase) {
            rndString = rndString.toLowerCase();
        }
        return rndString;
    };

    /**
     * Validate an external URL
     *
     * @param  {String}    url    The url that needs to be validated
     * @return {String}           The validated url
     * @throws {Error}            A parameter validation error
     */
    var validateExternalURL = exports.validateExternalURL = function(url) {
        if (!_.isString(url)) {
            throw new Error('An invalid value for url was provided');
        }

        // If no protocol was provided, prepend 'http://'
        var regExp = new RegExp(/\:\/\//g);
        if (!regExp.test(url)) {
            url = 'http://' + url;
        }

        // Return the validated url
        return url;
    };

    /**
     * Mock a XMLHttpRequest
     *
     * @param  {String}           type           The request type. (e.g. 'GET', 'POST'...)
     * @param  {String}           url            The request url
     * @param  {Number}           statusCode     The response status code (e.g. 200, 400, 503...)
     * @param  {Object}           headers        The response headers
     * @param  {Object|String}    body           The response body
     * @param  {Function}         requestFunc    The mock function
     * @throws {Error}                           A parameter validation error
     */
    var mockRequest = exports.mockRequest = function(type, url, statusCode, headers, body, requestFunc) {
        if (!_.isString(type)) {
            throw new Error('An invalid value for type was provided');
        } else if (!_.isString(url)) {
            throw new Error('An invalid value for url was provided');
        } else if (!_.isNumber(statusCode)) {
            throw new Error('An invalid value for statusCode was provided');
        } else if (!_.isObject(headers)) {
            throw new Error('An invalid value for headers was provided');
        } else if (_.isEmpty(body)) {
            throw new Error('An invalid value for body was provided');
        } else if (!_.isFunction(requestFunc)) {
            throw new Error('An invalid value for callback was provided');
        }

        // Stringify the response body
        body = JSON.stringify(body);

        // Require Sinon before continuing
        require(['sinon'], function(sinon) {
            var server = sinon.fakeServer.create();
            server.respondWith(type, url, [statusCode, headers, body]);

            // Execute the request
            requestFunc();

            // Mock the response
            server.respond();
            server.restore();
        });
    };


    ///////////////////
    // LOCAL STORAGE //
    ///////////////////

    /**
     * All the functionality related to local storage
     *
     * @return  {Object}    Object containing the local storage functionality
     */
    var localDataStorage = exports.localDataStorage = function() {

        /**
         * Return a value from the local storage
         *
         * @param  {String}                 key    The key of the value that needs to be retrieved from the local storage
         * @return {Object|Array|String}           The requested value
         * @throws {Error}                         A parameter validation error
         */
        var get = function(key) {
            if (!_.isString(key)) {
                throw new Error('An invalid value for \'key\' was provided');
            }

            // Return an entry from the local storage
            return JSON.parse(localStorage.getItem(key));
        };

        /**
         * Remove a local value
         *
         * @param  {String}       key    The key of the entry that needs to be stored
         * @return {undefined}
         * @throws {Error}               A parameter validation error
         */
        var remove = function(key) {
            if (!_.isString(key)) {
                throw new Error('An invalid value for \'key\' was provided');
            }

            // Remove the entry from the local storage
            return localStorage.removeItem(key);
        };

        /**
         * Store a value in the local storage
         *
         * @param  {String}                 key      The key of the entry that needs to be stored
         * @param  {Object|Array|String}    value    The value of the key that needs to be stored
         * @return {undefined}
         * @throws {Error}                           A parameter validation error
         */
        var store = function(key, value) {
            if (!_.isString(key)) {
                throw new Error('An invalid value for \'key\' was provided');
            }

            // Add the entry to the local storage
            try {
                return localStorage.setItem(key, JSON.stringify(value));
            } catch(err) {
                throw new Error('An invalid value was provided');
            }
        };

        return {
            'get': get,
            'remove': remove,
            'store': store
        };
    };


    ///////////////////
    // NOTIFICATIONS //
    ///////////////////

    /**
     * Show a Growl-like notification message. A notification can have a title and a message, and will also have
     * a close button for closing the notification. Notifications can be used as a confirmation message, error message, etc.
     *
     * This function is mostly just a wrapper around jQuery.bootstrap.notify.js and supports all of the options documented
     * at https://github.com/goodybag/bootstrap-notify.
     *
     * @param  {String}     title       The notification title
     * @param  {String}     [message]   The notification message that will be shown underneath the title
     * @param  {String}     [type]      The notification type. The supported types are `success`, `error` and `info`, as defined in http://getbootstrap.com/components/#alerts. By default, the `success` type will be used
     * @param  {String}     [id]        Unique identifier for the notification, in case a notification can be triggered twice due to some reason. If a second notification with the same id is triggered it will be ignored
     * @param  {Boolean}    [sticky]    Whether or not the notification should be sticky. Defaults to `false`
     * @return {Boolean}                Returns true when the notification has been shown
     * @throws {Error}                  Error thrown when no message has been provided
     */
    var notification = exports.notification = function(title, message, type, id, sticky) {
        if (!title) {
            throw new Error('A valid notification title should be provided');
        }

        if (id && $('#' + id).length) {
            return false;
        }

        // Check if the notifications container has already been created.
        // If the container has not been created yet, we create it and add
        // it to the DOM.
        var $notificationContainer = $('#gh-notification-container');
        var randomId = generateRandomString();
        if ($notificationContainer.length === 0) {
            $notificationContainer = $('<div>').attr('id', 'gh-notification-container').addClass('notifications bottom-left');
            $('body').append($notificationContainer);
        }

        // Wrap tit title in an h4 and prepend it to the message
        message = '<div data-internal-id="' + randomId + '"><h4>' + title + '</h4>' + (message ? '<p>' + message + '</p>' : '') + '</div>';

        // If an ID has been provided, add the `id` attribute to the message
        if (id) {
            message = $(message).attr('id', id);
        }

        // Show the notification
        $notificationContainer.notify({
            'fadeOut': {
                'enabled': !sticky,
                'delay': 7000
            },
            'type': type ? type : 'success',
            'message': {'html': message}
        }).show();

        // Cache the rendered notification object to refer to it later
        var $notification = $($('[data-internal-id]', $notificationContainer).closest('.alert'));

        // Wait until the call stack has cleared before animating
        setTimeout(function() {
            $notification.removeClass('fade in');
            $notification.addClass('gh-notification-in');
        }, 10);

        /* istanbul ignore else */
        if (!sticky) {
            // Fade out and remove the container after 5 seconds if it's not marked as sticky
            /* istanbul ignore next */
            var fadeTimeout = setTimeout(function() {
                if (!sticky) {
                    $notification.addClass('gh-notification-fade');
                }
            }, 7000);
        }

        // Close the notification when the 'X' is clicked
        /* istanbul ignore next */
        $('a.close', $notificationContainer).off('click').on('click', function(ev) {
            // Add the fade animation to remove the popover from view
            $(this).closest('.alert').addClass('gh-notification-fade');
            // Remove the notification from the DOM after the animation finishes
            setTimeout(function() {
                $(this).closest('.alert').remove();
            }, 500);
            // Clear the timeout that removes the notification
            clearTimeout(fadeTimeout);
            // Avoid default link click behaviour
            return false;
        });

        return true;
    };


    ///////////////
    // REDIRECTS //
    ///////////////

    /**
     * All functionality related to redirecting users to error pages, etc.
     */
    /* istanbul ignore next */
    var redirect = exports.redirect = function() {

        /**
         * Redirect the current user to the 401 page. This can be used when the user requests a page or entity
         * to which no access should be granted.
         */
        var accessdenied = function() {
            window.location = '/accessdenied';
        };

        /**
         * Redirect the current user to the 404 page. This can be used when the user requests a page or entity
         * that cannot be found.
         */
        var notfound = function() {
            window.location = '/notfound';
        };

        /**
         * Redirect the current user to the 503 page. This can be used when the user requests a page on a tenant
         * that is currently not available
         */
        var unavailable = function() {
            window.location = '/unavailable';
        };

        return {
            'accessdenied': accessdenied,
            'notfound': notfound,
            'unavailable': unavailable
        };
    };


    //////////////////
    //  BATCH EDIT  //
    //////////////////

    /**
     * Create and return user objects found in the provided $hiddenFields container
     *
     * @param  {jQuery}    $hiddenFields    The container where the hidden fields to create the user objects with can be found in
     * @return {User[]}                     Array of user objects
     * @throws {Error}                      A parameter validation error
     */
    var getOrganiserObjects = exports.getOrganiserObjects = function($hiddenFields) {
        if (!$hiddenFields) {
            throw new Error('An invalid value for $hiddenFields was provided');
        }
        // Get all hidden fields in the container
        $hiddenFields = $($hiddenFields).find('input[data-add="true"]');
        // Cache the Array of organisers to return
        var organisers = [];

        // Create a user object for each hidden field in the container
        _.each($hiddenFields, function(hiddenField) {
            organisers.push({
                'displayName': hiddenField.value,
                'id': $(hiddenField).attr('data-id')
            });
        });

        // Return the Array of user objects
        return organisers;
    };


    //////////////////////
    //  INITIALISATION  //
    //////////////////////

    /**
     * Extend the basic utils with specific functionality
     *
     * @private
     */
    var initialise = function(that) {

        // Gather all the specific funtionality classes
        var utilClasses = [
            instrumentation,
            orgunits,
            state,
            templates,
            time
        ];

        // Extend the util class
        _.each(utilClasses, function(utilClass) {
            _.extend(that, utilClass);
        });
    };

    initialise(this);
});
