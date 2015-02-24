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

define([], function() {
    /**
     * Function that checks whether the server is available by checking a
     * valid response from the me feed. If it is responding, it redirects
     * to the me page. We're not using the APIs as loading those would
     * result in an infinite loop to the `/unavailable` page
     */
    var checkServerAvailable = function () {
        $.ajax({
            'url': '/api/me',
            'success': function() {
                window.location = '/';
            }
        });
    };

    checkServerAvailable();

    // Re-check every minute to see if the server has come back online
    setInterval(checkServerAvailable, 60000);
});
