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

var argv = require('optimist').argv;
var childProcess = require('child_process');

var ghRoot = __dirname + '/../../grasshopper/';
var ghModules = ghRoot + 'node_modules/';
var log = require(ghModules + 'gh-core/lib/logger').logger('before-tests');

var TestsUtil = require(ghModules + 'gh-tests/lib/util');

require('./beforeTests.js')(function() {
    // Start the tests
    var testRunner = childProcess.spawn(__dirname + '/runTests.sh', [argv.t], {
        'detached': true
    });

    // Print test output in the console
    testRunner.stdout.on('data', function(data) {
        process.stdout.write(data.toString());
    });

    // Print test errors in the console
    testRunner.stderr.on('data', function(data) {
        process.stderr.write(data.toString());
    });

    // Pass on the exit code after the tests finish and stop the child process
    testRunner.on('exit', function(exitCode) {
        process.exit(exitCode);
    });
});
