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

define(['gh.core', 'bootstrap.listview'], function(gh) {

    // Dummy module JSON data to render the partial with
    var dummyModules = [
        {
            "description": "S1: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "displayName": "S1: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "eventSummary": "S1: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "id": 0,
            "subscribed": false,
            'events': [
                {
                    "description": "Citizenship",
                    "displayName": "Citizenship",
                    "location": "Seminar Room, Social Anthropology",
                    "notes": "Mi1-4 W 10",
                    "subscribed": false,
                    "organisers": [
                        {
                            "organiser": {
                                "user": {
                                    "displayName": "Dr S Lazar",
                                    "isAdmin": false
                                }
                            }
                        }
                    ]
                },
                {
                    "description": "Citizenship",
                    "displayName": "Citizenship",
                    "location": "Seminar Room, Social Anthropology",
                    "notes": "Mi1-4 W 10",
                    "subscribed": false,
                    "organisers": [
                        {
                            "organiser": {
                                "user": {
                                    "displayName": "Dr S Lazar",
                                    "isAdmin": false
                                }
                            }
                        }
                    ]
                },
                {
                    "description": "Citizenship",
                    "displayName": "Citizenship",
                    "location": "Seminar Room, Social Anthropology",
                    "notes": "Mi1-4 W 10",
                    "subscribed": false,
                    "organisers": [
                        {
                            "organiser": {
                                "user": {
                                    "displayName": "Dr S Lazar",
                                    "isAdmin": false
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            "description": "S2: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "displayName": "S2: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "eventSummary": "S2: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "id": 0,
            "subscribed": false,
            'events': [
                {
                    "description": "Citizenship 2",
                    "displayName": "Citizenship 2",
                    "location": "Seminar Room, Social Anthropology",
                    "notes": "Mi1-4 W 10",
                    "subscribed": true,
                    "organisers": [
                        {
                            "organiser": {
                                "user": {
                                    "displayName": "Dr S Lazar",
                                    "isAdmin": false
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ];

    /**
     * Render the header
     */
    var renderHeader = function() {
        gh.api.utilAPI.renderTemplate($('#gh-header-template'), {
            'gh': gh
        }, $('#gh-header'));
    };

    /**
     * Render the modules in the sidebar
     */
    var renderModules = function() {
        gh.api.utilAPI.renderTemplate($('#gh-modules-template'), {
            'data': dummyModules
        }, $('#gh-modules-container'));
    };

    /**
     * Log in using the local authentication strategy
     *
     * @return {Boolean}     Return false to avoid default form behaviour
     */
    var doLogin = function() {
        var formValues = _.object(_.map($(this).serializeArray(), _.values));
        gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
            if (!err) {
                window.location = '/';
            } else {
                // Show an error to the user
            }
        });

        return false;
    };

    /**
     * Add bindings to various elements on the page
     */
    var addBinding = function() {
        $('body').on('submit', '#gh-signin-form', doLogin);
    };

    /**
     * Initialise the page
     */
    var initIndex = function() {
        addBinding();
        renderHeader();
        renderModules();
    };

    initIndex();
});
