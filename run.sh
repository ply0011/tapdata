#!/bin/bash 
 
set -u

__bash_dir__="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# SKIP_SDC_SOURCE_TEST="${SKIP_SDC_SOURCE_TEST:-false}"
SKIP_BUILD_LIB="${SKIP_BUILD_LIB:-false}"
SKIP_RUN_SDC=${SKIP_RUN_SDC:-false}
DEV_MODE="${DEV_MODE:-true}"

TAP_DATA_VERSION=tapdata-1.2.1
export TAP_DATA_VERSION

PID=$(ps -ef|grep tapdata|grep -v grep|awk '{print $2}')
echo 'TAPDATA PID:'$PID

make_dist_dir() {
    if [ ! -d "${__bash_dir__}/dist/" ]; then
        mkdir "${__bash_dir__}/dist"
    fi
    if [ ! -d "${__bash_dir__}/dist/target" ]; then
        mkdir "${__bash_dir__}/dist/target"
    fi
    if [ ! -d "${__bash_dir__}/dist/target/${TAP_DATA_VERSION}" ]; then
        mkdir "${__bash_dir__}/dist/target/${TAP_DATA_VERSION}"
    fi
}

download_sdc() {
    echo "start to download sdc core"
    export SDC_VERSION="3.2.0.0-SNAPSHOT"
    cd "${__bash_dir__}/dist"
    if [ ! -f "${__bash_dir__}/dist/streamsets-datacollector-core-${SDC_VERSION}.tgz" ]; then
        curl -O http://nightly.streamsets.com.s3-us-west-2.amazonaws.com/datacollector/latest/tarball/streamsets-datacollector-core-${SDC_VERSION}.tgz
    fi
    rm -rf "${__bash_dir__}/dist/target/${TAP_DATA_VERSION}"
    tar -xvf streamsets-datacollector-core-${SDC_VERSION}.tgz  &> /dev/null
    mv streamsets-datacollector-${SDC_VERSION} "${__bash_dir__}/dist/target/${TAP_DATA_VERSION}"
    rm  -rf "target/${TAP_DATA_VERSION}/sdc-static-web"
    cd "${__bash_dir__}"
}

install_ui_lib() {
    cd "${__bash_dir__}/datacollector-ui"
    if hash yarn 2>/dev/null; then
        yarn install
        yarn global add bower
        yarn global add grunt-cli
        bower install --allow-root
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
    #echo "start to check sdc download"
    #download_sdc
    
    echo "start to run sdc"
    cd "${__bash_dir__}"/dist/target/"$TAP_DATA_VERSION"
    
    export SDC_FILE_LIMIT=1024
    # dist/sdc/bin/streamsets dc
    # BUILD_ID=dontKillMe  nohup dist/sdc/bin/streamsets dc &
    BUILD_ID=dontKillMe nohup ./bin/streamsets dc>log/nohup 2>&1 &
}

main () {
    
    make_dist_dir 
    
    # if [ "$SKIP_SDC_SOURCE_TEST" != "true" ]; then
    #     download_sdc
    # fi   

    if [ "$SKIP_BUILD_LIB" != "true" ]; then
       install_ui_lib
    fi

    if [ "$DEV_MODE" = "true" ]; then
        watch_ui
    else 
        build_ui
        echo "Done: built dist html files in ./dist/target/${TAP_DATA_VERSION}"
    fi 

    if [ "$SKIP_RUN_SDC" = "false" ]; then
        #kill $(lsof -t -i:18630)
	if [ "$PID" != "" ]; then
	  echo 'KILL TAPDATA'
	  kill -9 $PID
	else
	  echo 'TAPDATA IS NOT RUNNING'
	fi
        echo 'starting sdc'
        run_sdc
    else
	echo 'not starting sdc'
    fi
 
    
}
main "$@"
