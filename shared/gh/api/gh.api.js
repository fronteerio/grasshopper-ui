/**
 * Initialises the grasshopper APIs
 */
define(['gh.api.authentication'], function(authenticationAPI) {

        var gh = {
            'api': {
                'authentication': authenticationAPI,
            }
        };

        var initGH = function(callback) {
            callback(gh);
        };

        return {
            /*!
             * Invoked when the module has been loaded, which can trigger initialization in a chained manner.
             */
            'load': function(name, parentRequire, load, config) {
                initGH(load);
            }
        };
    }
);
