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

define(['gh.core', 'gh.constants', 'validator', 'gh.calendar', 'gh.header', 'gh.footer', 'gh.student.listview', 'gh.student.terms-and-conditions', 'gh.video'], function(gh, constants) {

    /**
     * Display the appropriate view depending on the state of the selected part
     *
     * @param  {Object}    evt     The dispatched jQuery event
     * @param  {Object}    data    Object containing the module data
     * @private
     */
    var onPartSelected = function(evt, data) {
        // Retrieve the selected part data
        var selectedPart = _.find(gh.utils.triposData().parts, function(part) { return part.id === data.partId; });
        if (!data.modules.results.length || (selectedPart && !selectedPart.published)) {

            // Request the organisational units for the selected part
            gh.api.orgunitAPI.getOrgUnit(data.partId, true, function(err, data) {

                // Show the empty timetable notification
                showEmptyTimetable(evt, data);
            });

        // Show/hide components when a timetable was selected
        } else {
            $('#gh-page-container').removeClass('gh-minimised');
            $('#gh-empty').hide();
            $('#gh-main').show();
        }

        // Hide the video to give more screen real-estate to the calendar. Don't
        // call out to `hideVideo` as that will permanently hide the video by
        // storing data in the browser's local storage.
        $('#gh-main .gh-video').hide();
    };

    /**
     * Fetch the tripos data
     *
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.triposData    Object containing the tripos data
     * @private
     */
    var fetchTriposData = function(callback) {
        gh.utils.getTriposStructure(null, false, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not fetch triposes', constants.messaging.default.error, 'error');
            }

            return callback(data);
        });
    };

    /**
     * Show the empty timetable notification
     *
     * @param  {Object}    evt     The dispatched jQuery event
     * @param  {Object}    data    Object containing the module data
     * @private
     */
    var showEmptyTimetable = function(evt, data) {
        data = data.record || data;

        // Render the 'empty-timetable' template
        gh.utils.renderTemplate('student-empty-timetable', {
            'data': {
                'gh': gh,
                'record': data
            }
        }, $('#gh-empty'));

        // Show/hide components when an empty timetable was selected
        $('html').removeClass('gh-collapsed gh-collapsed-finished');
        $('#gh-page-container').addClass('gh-minimised');
        $('#gh-main').hide();
        $('#gh-empty').show();

        // Track the user selecting an empty part
        gh.utils.trackEvent(['Navigation', 'Draft timetable page shown']);
    };


    /////////////
    //  VIDEO  //
    /////////////

    /**
     * Hide the help video
     *
     * @private
     */
    var hideVideo = function() {
        // Show the video in the list
        $('#gh-main .gh-video').show();
        // Hide the video on the top
        $('#gh-main .gh-video:first-child').hide();
        // Do not show the video next time
        gh.utils.localDataStorage().store('hideVideo', true);
        // Track the user hiding the video
        gh.utils.trackEvent(['Navigation', 'Home', 'Intro video collapsed']);
        // Stop the video
        $(document).trigger('gh.video.stop');
    };

    /**
     * Show the help video
     *
     * @private
     */
    var showVideo = function() {
        // Hide the video in the list
        $('#gh-main .gh-video').hide();
        // Show the video on the top
        $('#gh-main > .gh-video').show();
        // Scroll to the top to see the video
        $('body').animate({scrollTop: 0}, 200);
        // Start the video
        $(document).trigger('gh.video.play', {'id': 'studenthowto'});
    };

    /**
     * Play the help video
     *
     * @private
     */
    var playVideo = function() {
        // Track the user playing the video
        gh.utils.trackEvent(['Navigation', 'Home', 'Intro video played']);
        showVideo();
        return false;
    };


    ///////////////
    //  BINDING  //
    ///////////////

    /**
     * Add bindings to various elements on the page
     *
     * @private
     */
    var addBinding = function() {
        // Video events
        $('body').on('click', '.gh-hide-video', hideVideo);
        $('body').on('click', '.gh-play-video', playVideo);

        // Show the empty timetable page
        $(document).on('gh.empty.timetable', showEmptyTimetable);

        // Display the appropriate view
        $(document).on('gh.part.selected', onPartSelected);
    };


    //////////////////////
    //  INITIALISATION  //
    //////////////////////

    /**
     * Initialise the student UI
     *
     * @private
     */
    var initialise = function() {

        // Add binding to various components
        addBinding();

        // Fetch the tripos data before initialising the header and the calendar
        fetchTriposData(function(triposData) {

            // Set up the header
            $(document).trigger('gh.header.init', {
                'includeLoginForm': true,
                'isGlobalAdminUI': false,
                'triposData': triposData
            });

            // Set up the footer
            $(document).trigger('gh.footer.init');

            // Set up the calendar
            $(document).trigger('gh.calendar.init', {
                'triposData': triposData,
                'view': 'student',
                'target': '#gh-main-calendar'
            });

            // Render the student video if the user hasn't hidden it yet
            if (!gh.utils.localDataStorage().get('hideVideo')) {
                $('#gh-main .gh-video').show();
                gh.utils.renderTemplate('student-video', {}, $('#gh-main .gh-video'));
            } else {
                $('#gh-main .gh-video').hide();
            }
        });
    };

    initialise();
});
