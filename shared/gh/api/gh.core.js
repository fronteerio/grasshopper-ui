/*!
 * Load all of the 3rd party libraries that need to be present from the very beginning, as well as the actual
 * core client-side OAE APIs
 */
define([
        /*!
         * The ! after `gh.api` indicates that this module is actually treated as a *plugin*, which is a special kind of
         * requirejs module. The difference we need is that the module can return a `load` function that can chain together
         * an initialization process client-size. We use this to initialize the client-side data.
         */
        'gh.api!',

        'jquery',
        'bootstrap',
    ],

    function(gh) {
        return gh;
    }
);
