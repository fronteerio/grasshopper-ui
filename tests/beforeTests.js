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

module.exports = function(callback) {
    var _ = require('lodash');
    var fs = require('fs');

    var ghRoot = __dirname + '/../../grasshopper/';
    var ghModules = ghRoot + 'node_modules/';

    var AdminsDAO = require(ghModules + 'gh-admins/lib/internal/dao');
    var AppsAPI = require(ghModules + 'gh-apps');
    var Context = require(ghModules + 'gh-context').Context;
    var EventsAPI = require(ghModules + 'gh-events');
    var GrassHopper = require(ghModules + 'gh-core/lib/api');
    var log = require(ghModules + 'gh-core/lib/logger').logger('before-tests');
    var OrgUnitAPI = require(ghModules + 'gh-orgunit');
    var SeriesAPI = require(ghModules + 'gh-series');
    var TestsUtil = require(ghModules + 'gh-tests/lib/util');

    // Create the configuration for the test
    var config = TestsUtil.createInitialTestConfig();

    var appId = 1;
    var file = __dirname + '/tree.json';

    // Start up the application server
    TestsUtil.setUpBeforeTests(config, function() {
        // Set up the tree structure
        setUpTreeStructure(callback);
    });

    /**
     * Set up a slimmed down organisational unit tree structure for testing
     *
     * @param {Function}    callback    Standard callback function
     */
    var setUpTreeStructure = function(callback) {
        // Get a global administrator
        AdminsDAO.getGlobalAdminByUsername('administrator', function(err, globalAdmin) {
            if (err) {
                console.log('err: ' + JSON.stringify(err) + ' - Failed to get the global administrator');
                process.exit(1);
            }

            // Get the app
            var ctx = new Context(null, globalAdmin);
            AppsAPI.getApp(ctx, appId, function(err, app) {
                if (err) {
                    console.error('err: ' + JSON.stringify(err), 'Failed to get the provided app');
                    process.exit(1);
                }

                ctx = new Context(app, globalAdmin);

                console.log('- Reading file ' + file);
                fs.readFile(file, function(err, tree) {
                    if (err) {
                        console.error('err: ' + JSON.stringify(err) + ' - file: ' +  JSON.stringify(file), 'Failed to read file');
                        process.exit(1);
                    }

                    // Parse the tree
                    console.log('- Parsing tree');
                    tree = JSON.parse(tree);

                    // Persist it
                    console.log('- Starting to persist the organizational tree, this is going to take a while');
                    var courses = _.values(tree.nodes);
                    createNodes(ctx, courses, null, function() {

                        // All done, execute the callback
                        console.log('- The organizational tree has been succesfully imported');
                        callback();
                    });
                });
            });
        });
    };

    /**
     * Recursively create the organizational units for a set of nodes.
     *
     * @param  {Node[]}           nodes                A set of nodes to create
     * @param  {OrgUnit|Serie}    [parent]             The parent under which the nodes should be created
     * @param  {Function}         callback             Standard callback function
     * @param  {Object}           callback.response    Object representing the created item (one of `course`, `subject`, `part`, `module`, `serie` or `event`)
     */
    var createNodes = function(ctx, nodes, parent, callback) {
        if (_.isEmpty(nodes)) {
            return callback();
        }

        // Create the node
        var node = nodes.pop();
        createNode(ctx, node, parent, function(createdItem) {
            // Create the child nodes, if any
            var childNodes = _.values(node.nodes);
            createNodes(ctx, childNodes, createdItem, function() {

                // All child nodes have been created, proceed
                // to the next sibling node, if any
                return createNodes(ctx, nodes, parent, callback);
            });
        });
    };


    /**
     * Create an organizational unit
     *
     * @param  {Node}             node                 The node to create
     * @param  {OrgUnit|Serie}    [parent]             The parent under which the node should be created
     * @param  {Function}         callback             Standard callback function
     * @param  {Object}           callback.response    Object representing the created item (one of `course`, `subject`, `part`, `module`, `serie` or `event`)
     */
    var createNode = function(ctx, node, parent, callback) {
        if (node.type === 'course' || node.type === 'subject' || node.type === 'part' || node.type === 'module') {
            createOrgUnit(ctx, node, parent, callback);
        } else if (node.type === 'serie') {
            createSerie(ctx, node, parent, callback);
        } else if (node.type === 'event') {
            createEvent(ctx, node, parent, callback);
        }
    };

    /**
     * Create an organisational unit
     *
     * @param  {Context}     ctx                  Standard context object containing the current user and the current application
     * @param  {Node}        node                 The node to create
     * @param  {OrgUnit}     parent               The parent under which the organisational unit should be created
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.response    Object representing the created organisational unit
     */
    var createOrgUnit = function(ctx, node, parent, callback) {
        var parentId = null;
        if (parent) {
            parentId = parent.id;
        }

        // Re-use the group id of the part if we're creating a module
        var groupId = null;
        if (node.type === 'module') {
            groupId = parent.GroupId;
        }
        OrgUnitAPI.createOrgUnit(ctx, appId, node.name.substring(0, 255), node.type, null, null, true, groupId, parentId, function(err, orgunit) {
            if (err) {
                console.error("DisplayName: '%s'", node.name);
                console.error("type: '%s'", node.type);
                console.error("groupId: '%s'", groupId);
                console.error("parentId: '%s'", parentId);
                console.error('err: ' + JSON.stringify(err), 'Failed to create orgunit');
                process.exit(1);
            }

            return callback(orgunit);
        });
    };

    /**
     * Create a serie
     *
     * @param  {Context}     ctx                  Standard context object containing the current user and the current application
     * @param  {Node}        node                 The node to create
     * @param  {OrgUnit      parent               The organisational unit under which the serie should be created
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.response    Object representing the created serie
     */
    var createSerie = function(ctx, node, parent, callback) {
        SeriesAPI.createSerie(ctx, appId, node.name.substring(0, 255), null, parent.GroupId, function(err, serie) {
            if (err) {
                console.error("DisplayName: '%s'", node.name);
                console.error('err: ' + JSON.stringify(err), 'Failed to create serie');
                process.exit(1);
            }

            parent.addSeries(serie).complete(function(err) {
                if (err) {
                    console.error("DisplayName: '%s'", node.name);
                    console.error('err: ' + JSON.stringify(err), 'Failed to add serie to orgunit');
                    process.exit(1);
                }

                return callback(serie);
            });
        });
    };

    /**
     * Create an event
     *
     * @param  {Context}     ctx                  Standard context object containing the current user and the current application
     * @param  {Node}        node                 The node to create
     * @param  {Serie}       parent               The serie under which the event should be created
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.response    Object representing the created event
     */
    var createEvent = function(ctx, node, parent, callback) {
        // TT's data isn't always correct
        var start = node.start;
        var end = node.end;
        if (start > end) {
            start = node.end;
            end = node.start;
            console.error('node: ' + JSON.stringify(node), 'Impossible start/end dates');
        }
        var opts = {
            'group': parent.GroupId,
            'series': [parent.id]
        };
        EventsAPI.createEvent(ctx, appId, node.name.substring(0, 255), start, end, opts, function(err, event) {
            if (err) {
                console.error("DisplayName: '%s'", node.name);
                console.error('err: ' + JSON.stringify(err), 'Failed to create event');
                process.exit(1);
            }
            return callback(event);
        });
    };
};
