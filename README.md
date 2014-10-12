# Grasshopper UI

A container for grasshopper applications

## Installation

### Interfaces

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

```
# Add a homebrew tap
brew tap homebrew/apache

# Install apache 2.4
brew install httpd24

# Create a sites-enabled directory
mkdir /usr/local/etc/apache2/2.4/sites-enabled

# Generate the apache configuration files
grunt configApache

# Place the generate apache files in the correct places
cp target/apache/httpd.conf /usr/local/etc/apache2/2.4/httpd.conf
cp -R target/apache/app_*.conf /usr/local/etc/apache2/2.4/sites-enabled/

# Retart apache
sudo /usr/local/bin/apachectl restart
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
