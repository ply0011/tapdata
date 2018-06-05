#!/bin/bash 
 
set -u

export SKIP_RUN_SDC=true SKIP_BUILD_LIB=false  DEV_MODE=false
./run.sh
