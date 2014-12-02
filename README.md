# Grasshopper UI

A container for grasshopper applications

## Build status
[![Build Status](https://travis-ci.org/CUL-DigitalServices/grasshopper-ui.svg?branch=master)](https://travis-ci.org/CUL-DigitalServices/grasshopper-ui)

## Code coverage
[![Coverage Status](https://img.shields.io/coveralls/CUL-DigitalServices/grasshopper-ui.svg)](https://coveralls.io/r/CUL-DigitalServices/grasshopper-ui?branch=master)

## Dependencies
[![Dependency Status](https://david-dm.org/CUL-DigitalServices/grasshopper-ui.svg)](https://david-dm.org/CUL-DigitalServices/grasshopper-ui)
[![devDependency Status](https://david-dm.org/CUL-DigitalServices/grasshopper-ui/dev-status.svg)](https://david-dm.org/CUL-DigitalServices/grasshopper-ui#info=devDependencies)

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
127.0.0.1    admin.grasshopper.com
127.0.0.2    2014.cam.timetable.grasshopper.com
127.0.0.2    2013.cam.timetable.grasshopper.com
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
