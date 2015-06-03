#!/bin/bash
##
# This script will compile all the SASS files to normal CSS files
##

# Check if Compass is installed
if ! [ -x "$(command -v compass)" ]; then
  echo 'Compass is not installed'
  exit 0
fi

# Create the CSS files
function createCSS () {

    # Set the source and target directories
    compass config --force config.rb --sass-dir=$1 --css-dir=$2

    # Make the shared files available for import
    compass compile -I "shared/gh/scss" -I "apps/admin/ui/scss" -I "apps/timetable/admin/ui/scss"
}

# Generate the CSS files for the student UI
createCSS apps/timetable/ui/scss apps/timetable/ui/css

# Generate the CSS files for the admin UI
createCSS apps/timetable/admin/ui/scss apps/timetable/admin/ui/css

# Generate the CSS files for the admin app UI
createCSS apps/timetable/admin/app/scss apps/timetable/admin/app/css

# Generate the CSS files for the global admin UI
createCSS apps/admin/ui/scss apps/admin/ui/css

# Generate the CSS files for the error pages
createCSS shared/gh/errors/scss shared/gh/errors/css

# Generate the CSS files for the mobile phone view
createCSS shared/gh/mobile/scss shared/gh/mobile/css

# Remove the SASS cache folder
rm -rf .sass-cache
