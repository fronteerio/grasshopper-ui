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

/**
 * Admin utility functions
 */
var adminAPI = (function() {

    /**
     * Get all global administrators
     *
     * @param  {Number}      [limit]     The maximum number of results to retrieve
     * @param  {Number}      [offset]    The paging number of the results to retrieve
     * @param  {Function}    callback    Standard callback function
     */
    var getAdmins = function(limit, offset, callback) {
        var administrators = null;
        var err = null;

        mainUtil.callInternalAPI('admin', 'getAdmins', [null, null], function(_err, _administrators) {
            if (_err) {
                casper.echo('Could not retrieve the global administrators. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                err = _err;
            } else {
                administrators = _administrators;
            }
        });

        casper.waitFor(function() {
            return administrators !== null || err !== null;
        }, function() {
            callback(err, administrators);
        });
    };

    return {
        'getAdmins': getAdmins
    };
})();
