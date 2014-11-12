/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var _ = require('lodash');
var fs = require('fs');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        'target': process.env['DESTDIR'] || 'target',
        'coveralls': {
            'gh': {
                'src': 'coverage/lcov.info',
                'options': {
                    'src': 'coverage/lcov.info'
                }
            }
        },
        'qunit': {
            'gh': {
                'urls': ['http://admin.grasshopper.com/tests/qunit/tests/api.html'],
                'options': {
                    'urls': ['http://admin.grasshopper.com/tests/qunit/tests/api.html'],
                    'coverage': {
                        'disposeCollector': true,
                        'baseUrl': ".",
                        'src': ['shared/gh/api/*.js'],
                        'instrumentedFiles': 'target/coverage',
                        'lcovReport': 'coverage',
                        'linesThresholdPct': 85
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.loadNpmTasks('grunt-coveralls');

    // Task to fill out the Apache config template
    grunt.registerTask('configApache', function() {
        var infile = './apache/apache.js';

        // Get all the apps
        var apps = fs.readdirSync('apps');

        // Get the config
        var apacheConfig = require('./apache/apache.js');

        // Get each apps config and overlay it
        _.each(apps, function(app) {
            apacheConfig[app] = require('./apps/' + app + '/apache/apache.js');
        });
        grunt.config.set('apacheConf', apacheConfig);

        // Render the httpd config
        var httpdTemplate = grunt.file.read('apache/httpd.conf');
        var renderedConfig = grunt.template.process(httpdTemplate);
        var outfile = grunt.config('target') + '/apache/httpd.conf';
        grunt.file.write(outfile, renderedConfig);
        grunt.log.writeln('httpd.conf rendered at '.green + outfile.green);

        // Render each app/vhost
        _.each(apps, function(appName) {
            apacheConfig[appName].errorLog = apacheConfig.logDirectory + appName + '_error.log';
            apacheConfig[appName].customLog = apacheConfig.logDirectory + appName + '_custom.log';

            var template = grunt.file.read('apps/' + appName + '/apache/app.conf');
            var renderedConfig = grunt.template.process(template);
            var outfile = grunt.config('target') + '/apache/app_' + appName + '.conf';
            grunt.file.write(outfile, renderedConfig);
            grunt.log.writeln(appName + '.conf rendered at '.green + outfile.green);
        });
    });
};
