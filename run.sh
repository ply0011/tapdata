#!/bin/bash 

# cd dist 
# export SDC_VERSION="3.2.0.0-SNAPSHOT"	
# if [ ! -f streamsets-datacollector-core-${SDC_VERSION}.tgz ]; then
#     curl -O http://nightly.streamsets.com.s3-us-west-2.amazonaws.com/datacollector/latest/tarball/streamsets-datacollector-core-${SDC_VERSION}.tgz
    
# fi
# tar -xvf streamsets-datacollector-core-${SDC_VERSION}.tgz 
# mv streamsets-datacollector-${SDC_VERSION} sdc
# rm sdc/sdc-static-web


 
# first time init
# cd datacollector-ui
# npm i
# npm install -g bower
# npm install -g grunt-cli
# bower install --allow-root

 

# #  dev set up
export SDC_FILE_LIMIT=4864
dist/sdc/bin/streamsets dc


# cd datacollector-ui
# grunt build
ln -s target/dist   ../dist/sdc/sdc-static-web

