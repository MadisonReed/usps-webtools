#! /bin/bash

BASE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
. $BASE/setup.cfg;

set -e;

eslint $PROJ_DIR --quiet;
progress "Lint passed";

jscs $PROJ_DIR;
progress "Coding style passed";
