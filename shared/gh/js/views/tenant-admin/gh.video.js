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

define(['gh.core', 'gh.constants'], function(gh, constants) {


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Render and play the video
     *
     * @private
     */
    var renderAndPlayVideo = function() {
        var youtubeId = constants.video.adminhowto;
        var videoURL = '//www.youtube.com/embed/' + youtubeId + '?enablejsapi=1&autoplay=1&hl=en-gb&modestbranding=1&rel=0&showinfo=0&color=white&theme=light';

        gh.utils.renderTemplate('admin-video', {
            'videoURL': videoURL
        }, $('#gh-video-container'), function() {
            $('.gh-video').addClass('isPlaying');
        });
    };

    /**
     * Stop the video by removing it from the page
     *
     * @private
     */
    var stopVideo = function() {
        $('.gh-video').removeClass('isPlaying');
        $('#gh-video-container').empty();
    };


    ///////////////
    //  BINDING  //
    ///////////////

    /**
     * Add handlers to various elements in the video component
     *
     * @private
     */
    var addBinding = function() {
        $(document).on('gh.video.play', renderAndPlayVideo);
        $(document).on('gh.video.stop', stopVideo);
    };


    //////////////////////
    //  INITIALISATION  //
    //////////////////////

    /**
     * Initialise the video component
     *
     * @private
     */
    var initialiseVideo = function() {
        addBinding();
    };

    initialiseVideo();
});
