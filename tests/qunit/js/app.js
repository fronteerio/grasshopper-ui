requirejs.config({
    'baseUrl': '/shared/',
    'paths': {
        'jquery': 'empty:',
        'lodash': 'vendor/js/lodash'
    }
});

require(['jquery','lodash'], function($, _) {

    // Cache the tests
    var tests = [];

    var totalScore = 0;
    var totalScoreFailed = 0;
    var totalScorePassed = 0;

    /**
     * Convert a module name to a class name
     *
     * @param  {String}    name    The module name that needs to be converted
     * @return {String}            The converted module name
     * @private
     */
    var convertModuleName = function(name) {
        return '#gh-test-' + name.toLowerCase().replace(' ','-');
    };

    /**
     * Mark a test as being run
     *
     * @param  {String}    name         The name of the test
     * @param  {String}    className    The name of the class to apply
     * @private
     */
    var markCurrentTest = function(name, className) {
        var testId = convertModuleName(name);
        $(testId).find('.gh-qunit-result').removeClass('info').addClass(className);
    };

    /**
     * Function that is executed when a QUnit module was finished
     *
     * @param  {Event}     event      The dispatched event
     * @param  {Object}    details    Object containing module details
     * @private
     */
    var onModuleDone = function(event, details) {
        var className = 'danger';
        if (!details.failed) {
            className = 'success';
        }
        markCurrentTest(details.name, className);
        updateRowScore(details.name, details);
        updateTotalScore(details);

        // Run the next test
        runTest();
    };

    /**
     * Function that is executed when a QUnit module has started
     *
     * @param  {Event}     event      The dispatched event
     * @param  {Object}    details    Object containing module details
     * @private
     */
    var onModuleStart = function(event, details) {
        markCurrentTest(details.name, 'info');
    };

    /**
     * Update the score for a test
     *
     * @param  {String}    name       The name of the QUnit module
     * @param  {Object}    details    Object containing module details
     * @private
     */
    var updateRowScore = function(name, details) {
        var testId = convertModuleName(name);
        // Update the score records
        $(testId).find('.gh-qunit-failed').html(details.failed);
        $(testId).find('.gh-qunit-passed').html(details.passed);
        $(testId).find('.gh-qunit-total').html(details.total);
    };

    /**
     * Reset the test suite
     *
     * @private
     */
    var resetSuite = function() {

        // Truncate the tests
        tests = [];

        // Reset the total scores
        totalScore = 0;
        totalScoreFailed = 0;
        totalScorePassed = 0;

        // Remove the classes from the tests
        $('.gh-qunit-row-test').find('.gh-qunit-result').removeClass('active success danger');

        // Remove the scores from the table cells
        $('td.gh-qunit-failed').html(0);
        $('td.gh-qunit-passed').html(0);
        $('td.gh-qunit-total').html(0);

        // Remove the total scores
        $('th.gh-qunit-total-failed').html(totalScoreFailed);
        $('th.gh-qunit-total-passed').html(totalScorePassed);
        $('th.gh-qunit-total-total').html(totalScore);
    };

    /**
     * Invoke all the QUnit tests
     *
     * @private
     */
    var runAllTests = function() {

        // Start listening to QUnit events
        addEventBinding();

        // Reset the test suite
        resetSuite();

        // Start running all the tests
        _runAllTests();

        // Disable the default button behaviour
        return false;
    };

    /**
     * Run the first test from the collection
     */
    var runTest = function() {
        if (tests.length) {
            return _runTest(tests.shift());
        }

        // Stop listening to QUnit events
        removeEventBinding();
    };

    /**
     * Run all the unit tests
     *
     * @private
     */
    var _runAllTests = function() {

        // Cache the current location
        var location = window.location.href;

        // Collect the test url's
        var $links = $('.gh-qunit-link a');
        _.each($links, function(link) {
            var url = location + $(link).attr('href');
            var name = $(link).html();
            tests.push({'name': name, 'url': url});
        });

        // Run the first test
        runTest();
    };

    /**
     * Run a specific test
     *
     * @param  {String}    test    The url of a test
     * @private
     */
    var _runTest = function(test) {
        $('#gh-qunit-bench-iframe').attr('src', test.url);
    };

    /**
     * Update the total scores
     *
     * @param  {Object}    details    Object containing module details
     * @private
     */
    var updateTotalScore = function(details) {

        // Update the global variables
        totalScore += details.total;
        totalScoreFailed += details.failed;
        totalScorePassed += details.passed;

        // Update the total score records
        $('.gh-qunit-total-failed').html(totalScoreFailed);
        $('.gh-qunit-total-passed').html(totalScorePassed);
        $('.gh-qunit-total-total').html(totalScore);
    };

    /**
     * Add event listeners to the UI components
     *
     * @private
     */
    var addBinding = function() {
        // Run all the unit tests
        $('#gh-btn-run-all-tests').on('click', runAllTests);
    };

    /**
     * Add event listeners for QUnit tests
     *
     * @private
     */
    var addEventBinding = function() {
        // When a QUnit module was completed
        $(window).on('done.module.qunit.gh', onModuleDone);
        // When a QUnit module was started
        $(window).on('start.module.qunit.gh', onModuleStart);
    };

    /**
     * Remove event listeners for QUnit tests
     *
     * @private
     */
    var removeEventBinding = function() {
        // When a QUnit module was completed
        $(window).off('done.module.qunit.gh', onModuleDone);
        // When a QUnit module was started
        $(window).off('start.module.qunit.gh', onModuleStart);
    };

    addBinding();
});
