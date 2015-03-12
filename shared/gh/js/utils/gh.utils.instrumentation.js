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

    var setUpInstrumentation = exports.setUpInstrumentation = function(me, callback) {
        // Load the segment.io JavaScript snippet
        !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","group","track","ready","alias","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.async=!0;e.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="3.0.1";
        analytics.load("GNOd0G9NERQiZDXTpTaNiu1f80nc1iP3");
        analytics.page();
        }}();

        if (!me.anon) {
            analytics.identify(me.id, {
                'name': me.displayName,
                'username': me.id,
                'user_type': me.isAdmin ? 'Administrator' : 'Student'
            });
        }

        callback();
    };

    /**
     * Record any actions that a user performs
     *
     * @param  {String}      event         The name of the event you’re tracking (@see https://segment.com/docs/spec/track/)
     * @param  {Object}      properties    A dictionary of properties for the event (@see https://segment.com/docs/spec/track/#properties)
     * @param  {Object}      options       A dictionary options, that let you do things like enable or disable specific integrations for the call
     * @param  {Function}    callback      A callback function that gets called after a short timeout, giving the browser time to make the track requests first
     */
    var trackEvent = exports.trackEvent = function(event, properties, options, callback) {
        // Depending on the UI that's loaded we prepend a different text
        // - SUI: for events in the student user interface
        // - AUI: for events in the administrator interface
        var prefix = 'SUI ';
        if ($('body').data('isadminui')) {
            prefix = 'AUI ';
        }
        window.analytics.track((prefix + event), properties, options, callback);
    };
});
