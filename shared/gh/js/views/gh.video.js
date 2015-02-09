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

define([], function() {


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Play the video
     *
     * @private
     */
    var playVideo = function() {
        $('.gh-video').addClass('isPlaying');
        var $video = $('#gh-video').get(0);
        $video.load();
        $video.play();
    };

    /**
     * Stop the video
     *
     * @private
     */
    var stopVideo = function() {
        $('.gh-video').removeClass('isPlaying');
        var $video = $('#gh-video').get(0);
        $video.pause();
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
        $(document).on('gh.video.play', playVideo);
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
