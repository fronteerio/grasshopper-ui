# Grasshopper UI

A container for grasshopper applications

## Build status
[![Build Status](https://travis-ci.org/fronteerio/grasshopper-ui.svg?branch=master)](https://travis-ci.org/fronteerio/grasshopper-ui)

## Dependencies
[![Dependency Status](https://david-dm.org/fronteerio/grasshopper-ui.svg)](https://david-dm.org/fronteerio/grasshopper-ui)
[![devDependency Status](https://david-dm.org/fronteerio/grasshopper-ui/dev-status.svg)](https://david-dm.org/fronteerio/grasshopper-ui#info=devDependencies)

## Installation

### Interfaces

On Linux, no need to add new loopback IP addresses manually, all of the 127.0.0.0/8 block (IPv4 loopback) is already enabled by default.

On OS X:

```
# Add a local loopback interface for IP 127.0.0.2
sudo ifconfig lo0 alias 127.0.0.2 up
```

### Hosts

```
# Create the appropriate hosts mappings in /etc/hosts
127.0.0.1    admin.grasshopper.local
127.0.0.2    2013.timetable.cam.ac.uk
127.0.0.2    2014.timetable.cam.ac.uk
```

### Apache 2

Download Apache HTTP 2.4 (Follow the installation instructions from the [Apache website](http://httpd.apache.org/docs/2.4/install.html)).

```
# Create a sites-enabled directory
mkdir /usr/local/apache2/sites-enabled

# Generate the apache configuration files
grunt configApache

# Place the generated apache files in the correct places
cp target/apache/httpd.conf /usr/local/apache2/httpd.conf
cp -R target/apache/app_*.conf /usr/local/apache2/sites-enabled/

# Restart apache
sudo /usr/local/apache2/bin/apachectl restart
```

## How this works

Each type of app has its own IP address on which Apache listens. For example,
the admin application will listen on 127.0.0.1:80 and the timetable app will
listen on 127.0.0.2:80.

The grunt `configApache` task will do two things:
 - Generate a `httpd.conf` file that contains the basic configuration for Apache
 - Generate an `app_xxx.conf` file for each application under `apps/`

This allows you to generate special apache configurations PER application. This way
the global admin application can serve a different set of HTML files than the `timetable`
application.


## Compiling stylesheets

To reduce the number of requests, we concatenate all the CSS files using [SASS](http://sass-lang.com) and [Compass](http://compass-style.org).

To make use of this technology, make sure you have [Ruby](http://www.ruby-lang.org) installed before executing the following commands:
```
gem install sass
gem install compass
```

To compile the CSS files you can simply run `grunt watch` to compile the changed SCSS files automatically, or run `./etc/scripts/compileCSS.sh` from the folder root.


## Testing

The UI uses QUnit and Istanbul to provide functional tests and code coverage. CasperJS is used to take a more visual approach to testing by spinning up a headless webkit browser and clicking around while making assertions. Note that the CasperJS framework is in place but tests have not been written yet. Linting tests are available for JavaScript and CSS and comply to the standard of code we set for our projects ([Code styleguide](https://raw.githubusercontent.com/airbnb/javascript/master/README.md))

All tests can be run in the terminal by executing `grunt test`.

Notes:
 - `grunt test` will spin up a server for you. Grasshopper should be cloned into a sibling directory of the grasshopper-ui directory
 - `grunt test` will run on a separate `grasshoppertest` database and populate it with test data. This data is destroyed after the tests finish.
 - Running the tests in the UI will not use a separate test database.
 - Running the tests in the UI should be done through the admin application as the tests assume administration level permissions (e.g. http://your.admin.app/qunit).
 - Code coverage reports are available in `grasshopper-ui/coverage/` in the lcov or html format. Note that the coverage report will only be generated when running the full test suite with `grunt test`.

