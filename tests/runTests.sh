#!/bin/sh
# Run the full set of tests or a subset and keep track of
# the exit codes for each of the tests to exit at the end.

# Function to lint the source code
LINTEXITCODE=0
runLint() {
    node_modules/.bin/grunt lint
    LINTEXITCODE=$?
}

# Function to run the CasperJS test suite
CASPEREXITCODE=0
runCasperJSTests() {
    node_modules/.bin/grunt ghost
    CASPEREXITCODE=$?
}

# Function to run the QUnit test suite
QUNITEXITCODE=0
runQunitTests() {
    node_modules/.bin/grunt qunit
    QUNITEXITCODE=$?
}

# Lint the source code
runLint
# Run the CasperJS tests, if required
if [ $1 = "casper" ]  || [ $1 = "all" ]
    then
    runCasperJSTests
fi
# Run the QUnit tests, if required
if [ $1 = "qunit" ] || [ $1 = "all" ]
    then
    runQunitTests
fi

# Determine to end tests with failure or success exit code
EXITCODE=$((CASPEREXITCODE+QUNITEXITCODE+LINTEXITCODE))
exit $EXITCODE
