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

var _ = require('lodash');
var fs = require('fs');
var util = require('util');
var vm = require('vm');

module.exports = function(grunt) {


    ///////////////////
    // CONFIGURATION //
    ///////////////////

    grunt.initConfig({
        'clean': ['<%= target %>'],
        'copy': {
            'main': {
                'files': [
                    {
                        'expand': true,
                        'src': [
                            '**',
                            '!<%= target %>/.*/**',
                            '!node_modules/**',
                            '!tests'
                        ],
                        'dest': '<%= target %>/original'
                    }
                ]
            }
        },
        'coveralls': {
            'gh': {
                'src': 'coverage/lcov/lcov.info',
                'options': {
                    'src': 'coverage/lcov/lcov.info'
                }
            }
        },
        'csslint': {
            'options': {
                'adjoining-classes': false,
                'box-model': false,
                'box-sizing': false,
                'fallback-colors': false,
                'font-sizes': false,
                'ids': false,
                'import': false,
                'important': false,
                'overqualified-elements': false,
                'qualified-headings': false,
                'universal-selector': false,
                'unique-headings': false,
                'unqualified-attributes': false
            },
            'files': [
                'tests/**/*.css'
            ]
        },
        'exec': {
            'compileCSS': {
                'cmd': 'etc/scripts/compileCSS.sh'
            },
            'removeTarget': {
                'cmd': 'rm -rf <%= target %>/optimized/<%= target %>'
            },
            'runCasperTest': {
                'cmd': function(path) {
                    var includes = grunt.config('ghost').dist.options.includes;
                    var pre = grunt.config('ghost').dist.options.pre;

                    return 'casperjs test --includes=' + includes + ' --pre=' + pre + ' ' + path;
                }
            },
            'startCasperDependencies': {
                'cmd': 'node tests/startDependencies.js -t casper'
            },
            'startDependencies': {
                'cmd': 'node tests/startDependencies.js -t all'
            },
            'startQUnitDependencies': {
                'cmd': 'node tests/startDependencies.js -t qunit'
            },
            'stopGrasshopper': {
                'cmd': 'kill $(ps aux | grep \'node app.js\' | grep -v \'grep node app.js\' | awk \'{print $2}\') &> /dev/null || true'
            }
        },
        'ghost': {
            'dist': {
                'filesSrc': [
                    'apps/**/tests/*.js'
                ],
                // CasperJS test command options
                'options': {
                    // Specify the files to be included in each test
                    'includes': [
                        'tests/casperjs/util/include/gh.api.admin.js',
                        'tests/casperjs/util/include/gh.api.app.js',
                        'tests/casperjs/util/include/gh.api.authentication.js',
                        'tests/casperjs/util/include/gh.api.config.js',
                        'tests/casperjs/util/include/gh.api.event.js',
                        'tests/casperjs/util/include/gh.api.groups.js',
                        'tests/casperjs/util/include/gh.api.orgunit.js',
                        'tests/casperjs/util/include/gh.api.series.js',
                        'tests/casperjs/util/include/gh.api.tenant.js',
                        'tests/casperjs/util/include/gh.api.user.js',
                        'tests/casperjs/util/include/util.js'
                    ],
                    // Prepare te testing environment before starting the tests
                    'pre': ['tests/casperjs/util/prep.js'],
                    // Don't stop casperjs after first test failure
                    'failFast': false
                }
            }
        },
        'jshint': {
            'options': {
                'sub': true
            },
            'files': [
                'grunt.js',
                'apps/**/*.js',
                'shared/gh/**/*.js',
                'tests/casperjs/**/*.js',
                'tests/qunit/js/app.js',
                'tests/qunit/tests/js/*.js'
            ]
        },
        'qunit': {
            'gh': {
                'urls': [
                    'http://admin.grasshopper.local/qunit/api.admin',
                    'http://admin.grasshopper.local/qunit/api.app',
                    'http://admin.grasshopper.local/qunit/api.authentication',
                    'http://admin.grasshopper.local/qunit/api.config',
                    'http://admin.grasshopper.local/qunit/api.event',
                    'http://admin.grasshopper.local/qunit/api.groups',
                    'http://admin.grasshopper.local/qunit/api.orgunit',
                    'http://admin.grasshopper.local/qunit/api.series',
                    'http://admin.grasshopper.local/qunit/api.tenant',
                    'http://admin.grasshopper.local/qunit/api.user',
                    'http://admin.grasshopper.local/qunit/api.util'
                ],
                'options': {
                    'urls': [
                        'http://admin.grasshopper.local/qunit/api.admin',
                        'http://admin.grasshopper.local/qunit/api.app',
                        'http://admin.grasshopper.local/qunit/api.authentication',
                        'http://admin.grasshopper.local/qunit/api.config',
                        'http://admin.grasshopper.local/qunit/api.event',
                        'http://admin.grasshopper.local/qunit/api.groups',
                        'http://admin.grasshopper.local/qunit/api.orgunit',
                        'http://admin.grasshopper.local/qunit/api.series',
                        'http://admin.grasshopper.local/qunit/api.tenant',
                        'http://admin.grasshopper.local/qunit/api.user',
                        'http://admin.grasshopper.local/qunit/api.util'
                    ],
                    'coverage': {
                        'disposeCollector': true,
                        'baseUrl': ".",
                        'src': [
                            'shared/gh/js/*.js',
                            'shared/gh/js/controllers/*.js',
                            'shared/gh/js/utils/*.js'
                        ],
                        'instrumentedFiles': 'target/coverage',
                        'lcovReport': 'coverage/lcov',
                        'htmlReport': 'coverage/html',
                        'linesThresholdPct': 85,
                        'testTimeout': 120000
                    }
                }
            }
        },
        'requirejs': {
            'optimize': {
                'options': {
                    'appDir': './',
                    'baseUrl': './shared',
                    'mainConfigFile': './shared/gh/js/gh.bootstrap.js',
                    'dir': '<%= target %>/optimized',
                    'optimize': 'uglify',
                    'preserveLicenseComments': false,
                    'optimizeCss': 'standard',
                    // TODO: Replace this with a saner value
                    // @see https://github.com/jrburke/r.js/pull/653
                    'cssImportIgnore': '//fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,400,300,600,700&subset=latin,cyrillic-ext,latin-ext,greek-ext',
                    'inlineText': true,
                    'useStrict': false,
                    'pragmas': {},
                    'skipPragmas': false,
                    'skipModuleInsertion': false,
                    'modules': [{
                        'name': 'gh.core',
                        'exclude': ['jquery']
                    }],
                    'fileExclusionRegExp': /^(\.|apache|etc|node_modules|tests|tools)/,
                    'logLevel': 2
                }
            }
        },
        'sass': {
            'dist': {
                'options': {
                    'check': true,
                    'loadPath': [
                        'shared/gh/scss',
                        'apps/admin/ui/scss',
                        'apps/timetable/admin/ui/scss'
                    ]
                },
                'files': {
                    'src': [
                        '**/*.scss',
                        '!target/**/*.scss'
                    ]
                }
            }
        },
        'target': 'target',
        'ver': {
            'gh': {
                'basedir': '<%= target %>/optimized',
                'phases': [

                    // 1. Hash all the vendor fonts
                    {
                        'files': _hashFiles({
                            'directories': [
                                '<%= target %>/optimized/shared/vendor/fonts'
                            ]
                        }),
                        'references': _replacementReferences({
                            'directories': [
                                '<%= target %>/optimized/shared/vendor/css',
                            ],
                            'includeExts': ['css']
                        })
                    },

                    // 2. Hash all the vendor CSS and JS
                    {
                        'files': _hashFiles({
                            'directories': [
                                '<%= target %>/optimized/shared/vendor/css',
                                '<%= target %>/optimized/shared/vendor/js'
                            ]
                        }),
                        'references': _replacementReferences({
                            'directories': [
                                '<%= target %>/optimized/apps',
                                '<%= target %>/optimized/shared'
                            ],
                            'includeExts': ['html', 'css']
                        })
                    },

                    // 3. Hash the GH CSS and JS files
                    {
                        'files': _hashFiles({
                            'directories': [
                                '<%= target %>/optimized/shared/gh/**',
                                '!<%= target %>/optimized/shared/gh/img/favicon',
                                '<%= target %>/optimized/apps'
                            ],
                            'excludeExts': ['html']
                        }),
                        'references': _replacementReferences({
                            'directories': [
                                '<%= target %>/optimized/apps',
                                '<%= target %>/optimized/shared'
                            ],
                            'includeExts': ['html', 'js', 'css']
                        })
                    },

                    // 4. Hash the GH partial files
                    {
                        'files': _hashFiles({
                            'directories': [
                                '<%= target %>/optimized/shared/gh/partials',
                            ]
                        }),
                        'references': _replacementReferences({
                            'directories': [
                                '<%= target %>/optimized/shared'
                            ],
                            'includeExts': ['html', 'js']
                        })
                    }
                ],
                'version': '<%= target %>/optimized/hashes.json'
            }
        },
        'watch': {
            'css': {
                'files': '**/*.scss',
                'tasks': ['sass', 'exec:compileCSS']
            }
        }
    });


    ///////////////
    // NPM TASKS //
    ///////////////

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-ghost');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-ver');


    //////////////////
    // GRUNT TASKS  //
    //////////////////

    // Lint tasks for JavaScript and CSS
    grunt.registerTask('lint', 'Run jshint and csslint', ['jshint', 'csslint', 'sass']);
    // Run all tests
    grunt.registerTask('test', 'Run all tests (jshint, csslint, sass, QUnit and CasperJS)', ['exec:stopGrasshopper', 'exec:startDependencies']);
    // Run QUnit tests
    grunt.registerTask('q', 'Run the QUnit tests', ['exec:stopGrasshopper', 'exec:startQUnitDependencies']);
    // Generate a coverage report
    grunt.registerTask('coverage', 'Generate coverage reports through QUnit and Istanbul (outputs to ./coverage)', ['qunit']);
    // Run a single CasperJS test
    grunt.registerTask('casper', 'Run the CasperJS tests. A single test can be specified with the --path parameter. e.g., grunt casper --path /path/to/test.js', function(path) {
        path = path || grunt.option('path');

        if (path) {
            grunt.task.run('exec:runCasperTest:' + path);
        } else {
            grunt.log.ok('Running all CasperJS tests. If you intended to run a single test try `grunt casper --path /path/to/test.js`');
            grunt.task.run('exec:stopGrasshopper');
            grunt.task.run('exec:startCasperDependencies');
        }
    });

    /**
     * Task that changes the paths in the optimized Apache configuration files
     */
    grunt.registerTask('changePaths', function() {

        // Get all the apps
        var apps = fs.readdirSync('apps');
        var basedir = grunt.config('target') + '/optimized/';

        // Loop the Apache configuration files for every app
        _.each(apps, function(appName) {
            var file = basedir + 'apache/app_' + appName + '.conf';
            var fileContent = grunt.file.read(file);
            fileContent = fileContent.replace(/grasshopper-ui/g, 'grasshopper-ui/' + grunt.config('target') + '/optimized');
            grunt.file.write(file, fileContent);
            grunt.log.writeln(String('Apache file changed for app_' + appName + '.conf').green);
        });
    });

    /**
     * Task to fill out the Apache config template
     */
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
        var outfile = grunt.config('target') + '/optimized/apache/httpd.conf';
        grunt.file.write(outfile, renderedConfig);
        grunt.log.writeln('httpd.conf rendered at '.green + outfile.green);

        // Render each app/vhost
        _.each(apps, function(appName) {
            apacheConfig[appName].errorLog = apacheConfig.logDirectory + appName + '_error.log';
            apacheConfig[appName].customLog = apacheConfig.logDirectory + appName + '_custom.log';

            var template = grunt.file.read('apps/' + appName + '/apache/app.conf');
            var renderedConfig = grunt.template.process(template);
            var outfile = grunt.config('target') + '/optimized/apache/app_' + appName + '.conf';
            grunt.file.write(outfile, renderedConfig);
            grunt.log.writeln(appName + '.conf rendered at '.green + outfile.green);
        });
    });

    /**
     * Task to place an update slug on the gh.bootstrap.js file so that it always gets a new hash in a
     * build. This is needed because we do post-hash updates on the file to update module references and
     * if module reference hashes change, it's possible the gh.bootstrap.js file won't get a new hash
     * as a result
     */
    grunt.registerTask('touchBootstrap', function() {
        // Just place a comment in the file with the current timestamp
        util.format('\n// Date Built: %d', Date.now()).toEnd(util.format('%s/optimized/shared/gh/js/gh.bootstrap.js', grunt.config('target')));
    });

    /**
     * Task to hash files
     */
    grunt.registerTask('hashFiles', function() {
        this.requires('requirejs');
        this.requires('touchBootstrap');

        // Hash the GH files
        grunt.task.run('ver:gh');

        // Update the files in the bootstrap
        grunt.task.run('updateBootstrapPaths');
    });

    /**
     * Task that creates a release build
     *
     * @param  {String}    outputDir    The directory where the build should be stored
     *
     *  * Example:
     *  * grunt release:/tmp/release
     *  *
     *  * This will run the entire UI build (minification, hashing, apache config, etc, ..) and create the following folders:
     *  * /tmp/release/optimized  -  contains the minified UI sources
     *  * /tmp/release/original   -  contains the original UI files
     *  *
     */
    grunt.registerTask('release', function(outputDir) {
        if (!outputDir) {
            return grunt.log.writeln('Please provide a path where the release files should be copied to'.red);
        }
        grunt.config.target = outputDir;

        // Run the default production build task
        grunt.task.run('default');

        // Change the paths in the optimized Apache files
        grunt.task.run('changePaths');
    });

    /**
     * Task to update the paths in gh.bootstrap to the hashed versions
     */
    grunt.registerTask('updateBootstrapPaths', function() {
        this.requires('ver:gh');

        var basedir = grunt.config('target') + '/optimized/';
        var hashedPaths = require('./' + grunt.config.get('ver.gh.version'));
        var bootstrapPath = basedir + hashedPaths['/shared/gh/js/gh.bootstrap.js'];
        var bootstrap = grunt.file.read(bootstrapPath);
        var regex = /("|')?paths("|')?: ?\{[^}]*\}/;
        var scriptPaths = 'paths = {' + bootstrap.match(regex)[0] + '}';

        var paths = vm.runInThisContext(scriptPaths).paths;

        // Update the bootstrap file with the hashed paths
        Object.keys(paths).forEach(function(key) {
            var prefix = '/shared/';
            var path = prefix + paths[key] + '.js';
            var hashedPath = '';
            if (hashedPaths[path]) {
                hashedPath = hashedPaths[path];
                // trim off prefix and .js
                paths[key] = hashedPath.substring(prefix.length, hashedPath.length - 3);
            }
        });
        bootstrap = bootstrap.replace(regex, 'paths:' + JSON.stringify(paths));
        grunt.file.write(bootstrapPath, bootstrap);
        grunt.log.writeln('Boots strapped'.green);
    });

    // Default task for production build
    grunt.registerTask('default', 'Run the production build', ['clean', 'exec:compileCSS', 'copy', 'requirejs', 'touchBootstrap', 'hashFiles', 'exec:removeTarget', 'configApache']);
};

/**
 * Generate the glob expressions to match all extensions of files in the provided set of
 * directories. Any file with an extension that is found in the `excludeExts` option  will not be
 * hashed
 *
 * @param  {Object}     options                 An options object that specifies what files to hash
 * @param  {String[]}   options.directories     The list of directories whose files to hash
 * @param  {String[]}   [options.excludeExts]   The extensions of files to ignore when hashing files
 * @param  {String[]}   [options.extra]         Extra glob patterns to append, in addition to the ones added for the extensions
 * @return {String[]}                           An array of glob expressions that match the files to hash in the directories
 * @private
 */
var _hashFiles = function(options) {
    options.excludeExts = options.excludeExts || [];
    options.extra = options.extra || [];

    var globs = [];
    _.each(options.directories, function(directory) {
        globs.push(util.format('%s/**', directory));
        _.each(options.excludeExts, function(ext) {
            // Exclude both direct children of the excluded extensions, and all grand-children
            globs.push(util.format('!%s/*.%s', directory, ext));
            globs.push(util.format('!%s/**/*.%s', directory, ext));
        });
    });

    return _.union(globs, options.extra);
};

/**
 * Generate the standard replacement references for the given resource directories, and also
 * include the provided "extra" replacement files.
 *
 * @param  {Object}     options                 An options object that specifies what files to hash
 * @param  {String[]}   options.directories     A list of directories whose resource paths should be replaced
 * @param  {String[]}   [options.includeExts]   The file extensions that should have replacement performed
 * @param  {String[]}   [options.extra]         Additional replacements to perform
 * @return {String[]}                           The full derived list of all resources that replacement should be performed
 * @private
 */
var _replacementReferences = function(options) {
    options.includeExts = options.includeExts || [];
    options.extra = options.extra || [];

    var globs = [];
    _.each(options.directories, function(directory) {
        _.each(options.includeExts, function(ext) {
            globs.push(util.format('%s/**/*.%s', directory, ext));
        });
    });

    return _.union(globs, options.extra);
};
