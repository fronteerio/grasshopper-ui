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

define(['exports'], function(exports) {

    /**
     * Refresh the state by triggering the statechange event without making modifications
     */
    /* istanbul ignore next */
    var refreshState = exports.refreshState = function() {
        History.Adapter.trigger(window, 'statechange');
    };

    /**
     * Add a key/value pair to the URL state
     *
     * @param {Object}    toAdd        The key of the state parameter to set
     * @param {Boolean}   [replace]    Whether to replace the state or push a new one in. Setting to `true` is useful when the state needs to be updated but no history entry should be created. Defaults to `false`
     */
    /* istanbul ignore next */
    var addToState = exports.addToState = function(toAdd, replace) {
        // Construct an array to create the state string from
        var stateString = [];
        // Whether or not the key/value pair overrides an already existing state property
        var override = false;
        // Merge the current history with the arguments to add to it
        var currentState = _.extend(History.getState().data, toAdd);

        // For each entry, add it to the stateString
        _.each(currentState, function(value, key) {
            stateString.push(key + '=' + value);
        });

        // Create the URL to set the state to
        var url = '/?' + stateString.join('&');
        // If the admin UI is loaded, prepend '/admin/?'
        if ($('body').hasClass('gh-admin')) {
            url = '/admin' + url;
        }

        // Clear the queue
        History.clearQueue();

        if (replace) {
            // Replace with the new state
            History.replaceState(currentState, $('title').text(), url);
        } else {
            // Push the new state
            History.pushState(currentState, $('title').text(), url);
        }
    };

    /**
     * Remove one or more keys from the state
     *
     * @param  {String[]}    keys    Array of keys to remove from the state
     */
    /* istanbul ignore next */
    var removeFromState = exports.removeFromState = function(keys) {
        // Construct an array to create the state string from
        var stateString = [];
        // Get the current history state to work with
        var currentState = History.getState();
        // Cache the state data object to set
        var stateData = {};

        // If the state is already empty there is nothing to do
        if (_.isEmpty(currentState.data)) {
            return;
        }

        // Loop over each data entry in the state and remove the keys that match
        _.each(currentState.data, function(value, key) {
            // Remove the key from the state, if it's matched, by not adding it to the
            // updated state object
            if (_.indexOf(keys, key) === -1) {
                stateString.push(key + '=' + value);
                stateData[key] = value;
            }
        });

        // Create the URL to set the state to
        var url = '/?' + stateString.join('&');
        // If the admin UI is loaded, prepend '/admin/?'
        if ($('body').hasClass('gh-admin')) {
            url = '/admin' + url;
        }

        // Clear the queue
        History.clearQueue();

        // Replace the state data
        History.replaceState(stateData, $('title').text(), url);
    };

    /**
     * Set the state data. This is useful in functions that are using the data to determine what to add or remove
     */
    /* istanbul ignore next */
    var setStateData = exports.setStateData = function() {
        // Parse the URL that's in the History state.
        // The expected URL structure is `[/admin]/?tripos=123&part=234&module=567&series=890`
        var stateString = History.getState().cleanUrl.split('?');

        // The hostname is included in the stateString Array; if it has more than one item in it that means
        // there's some state handling to be done.
        if (stateString.length > 1) {
            // Cache the state data object to set
            var stateData = {};

            // Drop the hostname from the Array to only keep the hash
            stateString = stateString.pop();

            // Split the hash into an Array
            stateString = stateString.split('&');

            // For each key/value pair in the Array, assign it to the new state object
            _.each(stateString, function(s) {
                if (s) {
                    // Split the string into a key and value
                    s = s.split('=');
                    // Add the key/value pair to the state object
                    stateData[s[0]] = parseInt(s[1], 10);
                }
            });

            // Create the URL to set the state to
            var url = '/?' + stateString.join('&');
            // If the admin UI is loaded, prepend '/admin/?'
            if ($('body').hasClass('gh-admin')) {
                url = '/admin' + url;
            }

            // Clear the queue
            History.clearQueue();

            // Replace the state data
            History.replaceState(stateData, $('title').text(), url);
        }
    };
});
