/*!
 * Initalize requireJS by setting paths and specifying load priorities
 */
requirejs.config({
    'baseUrl': '/shared/',
    'paths': {
        // Vendor paths
        'bootstrap': 'vendor/js/bootstrap',
        'jquery': 'vendor/js/jquery-2.1.1',

        // GH API modules
        'gh.api': 'gh/api/gh.api',
        'gh.api.authentication': 'gh/api/gh.api.authentication',
        'gh.bootstrap': 'gh/api/gh.bootstrap',
        'gh.core': 'gh/api/gh.core'
    },
    'shim' : {
        'bootstrap' : {
            'deps': ['jquery'],
            'exports': 'Bootstrap'
        }
    },
    'waitSeconds': 30
});

/*!
 * Load all of the dependencies, core GH APIs, and the page-specific javascript file (if specified)
 */
require(['gh.core']);
