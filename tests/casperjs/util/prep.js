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

casper.test.begin('Prepare environment for tests', function(test) {

    // Override default timeouts
    casper.options.waitTimeout = configAPI.waitTimeout;

    // Set the default size of the viewport
    casper.options.viewportSize = {'width': 1200, 'height': 800};

    // Don't hide any errors
    casper.options.silentErrors = false;

    // Replace the default passText, failText and warnText shown next to assertions in the terminal
    test.options.passText = '✓';
    test.options.failText = 'X';
    test.options.warnText = '!';

    /**
     * Log any JavaScript errors in the page
     *
     * @param  {String}    msg    The error in the page
     */
    casper.echo('✓ Enable logging of errors in the DOM', 'INFO');
    casper.on('page.error', function(msg) {
        casper.echo('JavaScript error caught in the page: ' + msg, 'COMMENT');
    });

    /**
     * Catch remote callbacks and execute an event when the callback data has a callback ID
     *
     * @param  {Object}    data    Data sent back from within the callback
     */
    casper.echo('✓ Enable remote callbacks', 'INFO');
    casper.on('remote.callback', function(data) {
        if (data && data.cbId) {
            casper.emit(data.cbId + '.finished', data);
        }
    });

    /**
     * A function to be executed when a waitFor* function execution time exceeds the value of the waitTimeout option,
     * if any has been set. By default, on timeout the script will exit displaying an error,
     * except in test environment where it will just add a failure to the suite results.
     *
     * @param  {Number}    waitTimeout    Default wait timeout, for wait* family functions.
     */
    casper.echo('✓ Set the timeout to ' + configAPI.waitTimeout + 'ms', 'INFO');
    casper.options.onWaitTimeout = function(waitTimeout) {
        test.fail('Test timed out after ' + waitTimeout + ' ms');
        test.done();
    };

    test.done();
});
