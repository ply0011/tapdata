#!/bin/bash 
 
set -u

__bash_dir__="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# SKIP_SDC_SOURCE_TEST="${SKIP_SDC_SOURCE_TEST:-false}"
SKIP_BUILD_LIB="${SKIP_BUILD_LIB:-false}"
SKIP_RUN_SDC="${SKIP_RUN_SDC:-false}"
DEV_MODE="${DEV_MODE:-true}"

make_dist_dir() {
    if [ ! -d "${__bash_dir__}/dist" ]; then
        mkdir "${__bash_dir__}/dist"
    fi
    # if [ ! -d "${__bash_dir__}/dist/sdc" ]; then
    #     mkdir "${__bash_dir__}/dist/sdc"
    # fi
}

download_sdc() {
    echo "start to download sdc core"
    export SDC_VERSION="3.2.0.0-SNAPSHOT"
    cd "${__bash_dir__}/dist"
    if [ ! -f "${__bash_dir__}/dist/streamsets-datacollector-core-${SDC_VERSION}.tgz" ]; then
        curl -O http://nightly.streamsets.com.s3-us-west-2.amazonaws.com/datacollector/latest/tarball/streamsets-datacollector-core-${SDC_VERSION}.tgz
    fi
    rm -rf "${__bash_dir__}/dist/sdc"
    tar -xvf streamsets-datacollector-core-${SDC_VERSION}.tgz  &> /dev/null
    mv streamsets-datacollector-${SDC_VERSION} sdc
    rm  -rf sdc/sdc-static-web
    cd "${__bash_dir__}"
}

install_ui_lib() {
    cd "${__bash_dir__}/datacollector-ui"
    if hash yarn 2>/dev/null; then
        yarn install
        yarn global add bower
        yarn global add grunt-cli
        bower install
    else
        echo 'please install yarn for build environment.'
        exit 1;
    fi

    
}
build_ui() {
    echo "start to build html"
    cd "${__bash_dir__}/datacollector-ui"
  
    grunt build --force
}

watch_ui() {
    echo "start to grunt watch"
    cd "${__bash_dir__}/datacollector-ui"
    grunt watch --force
}

run_sdc() {
    echo "start to check sdc download"
    download_sdc
    
    echo "start to run sdc"
    cd "${__bash_dir__}"
    
    export SDC_FILE_LIMIT=1024
    # dist/sdc/bin/streamsets dc
    BUILD_ID=dontKillMe  nohup dist/sdc/bin/streamsets dc &
}

main () {
    
    make_dist_dir 
    
    # if [ "$SKIP_SDC_SOURCE_TEST" != "true" ]; then
    #     download_sdc
    # fi

    if [ "$SKIP_RUN_SDC" != "true" ]; then
        kill $(lsof -t -i:18630)
        echo 'starting sdc'
        run_sdc
    fi
    

    if [ "$SKIP_BUILD_LIB" != "true" ]; then
       install_ui_lib
    fi

    if [ "$DEV_MODE" = "true" ]; then
        watch_ui
    else 
        build_ui
        echo 'Done: built dist html files in ./dist/sdc/sdc-static-web'
    fi 
    
}
main "$@"