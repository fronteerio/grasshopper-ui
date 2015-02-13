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

define(['exports', 'gh.utils.templates', 'gh.utils.time', 'bootstrap-notify'], function(exports, templates, time) {


    ///////////////
    //  GENERAL  //
    ///////////////

    /**
     * Generates a random 10 character sequence of upper and lowercase letters.
     *
     * @param  {Boolean}    toLowerCase    Whether or not the string should be returned lowercase
     * @return {String}                    Random 10 character sequence of upper and lowercase letters
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
     * Mock a XMLHttpRequest
     *
     * @param  {String}           type           The request type. (e.g. 'GET', 'POST'...)
     * @param  {String}           url            The request url
     * @param  {Number}           statusCode     The response status code (e.g. 200, 400, 503...)
     * @param  {Object}           headers        The response headers
     * @param  {Object|String}    body           The response body
     * @param  {Function}         requestFunc    The mock function
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

    /**
     * Sort given objects based on the displayName property.
     * The list will be ordered from A to Z.
     *
     * @see Array#sort
     */
    var sortByDisplayName = exports.sortByDisplayName = function(a, b) {
        if (a.displayName.toLowerCase() < b.displayName.toLowerCase()){
            return -1;
        } else if (a.displayName.toLowerCase() > b.displayName.toLowerCase()) {
            return 1;
        }
        return 0;
    };

    /**
     * Sort given objects based on the host property.
     * The list will be ordered from A to Z.
     *
     * @see Array#sort
     */
    var sortByHost = exports.sortByHost = function(a, b) {
        if (a.host.toLowerCase() < b.host.toLowerCase()){
            return -1;
        } else if (a.host.toLowerCase() > b.host.toLowerCase()) {
            return 1;
        }
        return 0;
    };


    ////////////////////////
    //  GOOGLE ANALYTICS  //
    ////////////////////////

    /**
     * Set up Google Analytics tracking. Note that this is using Universal Tracking
     *
     * @private
     */
    /* istanbul ignore next */
    var googleAnalytics = function() {
        (function(i,s,o,g,r,a,m) {i['GoogleAnalyticsObject']=r;i[r]=i[r]||function() {
        (i[r].q=i[r].q||[]).push(arguments);};i[r].l=1*new Date();a=s.createElement(o);
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        // Add hostname to allow tracking of accessed tenant
        ga('create', 'UA-57660493-1', window.location.hostname);
        ga('send', 'pageview');

        // Add event handler to track JavaScript errors
        window.addEventListener('error', function(ev) {
            ga('send', 'event', 'JavaScript Error', 'log', ev.message + ' [' + ev.filename + ':  ' + ev.lineno + ']');
        });

        // Add event handler to track jQuery AJAX errors
        $(document).ajaxError(function(ev, request, settings, err) {
            ga('send', 'event', 'Ajax Error', 'log', settings.type + ' ' + settings.url + ' => ' + err + ' (' + request.status + ')');
        });
    };

    /**
     * Register a Google Analytics tracking event
     * (https://developers.google.com/analytics/devguides/collection/analyticsjs/events#overview)
     *
     * @param  {String}    category      Typically the object that was interacted with (e.g. button)
     * @param  {String}    action        The type of interaction (e.g. click)
     * @param  {String}    label         Useful for categorizing events (e.g. nav buttons)
     * @param  {Number}    [value]       Value of the action, values must be non-negative
     */
    var sendTrackingEvent = exports.sendTrackingEvent = function(category, action, label, value) {
        if (!_.isString(category)) {
            throw new Error('An invalid value for \'category\' has been provided');
        } else if (!_.isString(action)) {
            throw new Error('An invalid value for \'action\' has been provided');
        } else if (!_.isString(label)){
            throw new Error('An invalid value for \'label\' has been provided');
        } else if (value && !_.isNumber(value)) {
            throw new Error('An invalid value for \'value\' has been provided');
        }

        // Only send the value along when it's specified
        /* istanbul ignore next */
        if (value) {
            ga('send', 'event', category, action, label, value);
        } else {
            ga('send', 'event', category, action, label);
        }

        return true;
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
         * @param  {String}     key      The key of the entry that needs to be stored
         * @return {undefined}
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
     * @param  {String}    [title]    The notification title
     * @param  {String}    message    The notification message that will be shown underneath the title
     * @param  {String}    [type]     The notification type. The supported types are `success`, `error` and `info`, as defined in http://getbootstrap.com/components/#alerts. By default, the `success` type will be used
     * @param  {String}    [id]       Unique identifier for the notification, in case a notification can be triggered twice due to some reason. If a second notification with the same id is triggered it will be ignored
     * @throws {Error}                Error thrown when no message has been provided
     * @return {Boolean}              Returns true when the notification has been shown
     */
    var notification = exports.notification = function(title, message, type, id) {
        if (!message) {
            throw new Error('A valid notification message should be provided');
        }

        if (id && $('#' + id).length) {
            return false;
        }

        // Check if the notifications container has already been created.
        // If the container has not been created yet, we create it and add
        // it to the DOM.
        var $notificationContainer = $('#gh-notification-container');
        if ($notificationContainer.length === 0) {
            $notificationContainer = $('<div>').attr('id', 'gh-notification-container').addClass('notifications top-center');
            $('body').append($notificationContainer);
        }

        // If a title has been provided, we wrap it in an h4 and prepend it to the message
        if (title) {
            message = '<h4 id="' + id + '">' + title + '</h4>' + message;
        }

        // Show the actual notification
        $notificationContainer.notify({
            'fadeOut': {
                'enabled': true,
                'delay': 5000
            },
            'type': type,
            'message': {'html': message},
            'transition': 'fade'
        }).show();

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
            'notfound': notfound,
            'unavailable': unavailable
        };
    };


    ////////////////
    //  TRIPOSES  //
    ////////////////

    /**
     * Return the tripos structure
     *
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The tripos structure
     */
    /* istanbul ignore next */
    var getTriposStructure = exports.getTriposStructure = function(callback) {
        if (!_.isFunction(callback)) {
            throw new Error('An invalid value for callback was provided');
        }

        var core = require('gh.core');
        var appId = core.data.me && core.data.me.AppId ? core.data.me.AppId : null;
        require('gh.api.orgunit').getOrgUnits(null, false, true, null, ['course', 'subject', 'part'], function(err, data) {
            if (err) {
                return callback(err);
            }

            var triposData = {
                'courses': [],
                'subjects': [],
                'parts': [],
                'modules': []
            };

            triposData.courses = _.filter(data.results, function(course) {
                return course.type === 'course';
            });

            triposData.subjects = _.filter(data.results, function(subject) {
                return subject.type === 'subject';
            });

            triposData.parts = _.filter(data.results, function(part) {
                return part.type === 'part';
            });

            // Sort the data before displaying it
            triposData.courses.sort(sortByDisplayName);
            triposData.subjects.sort(sortByDisplayName);
            triposData.parts.sort(sortByDisplayName);

            return callback(null, triposData);
        });
    };

    // Initialise Google Analytics
    googleAnalytics();


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
