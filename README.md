# Stremasets Version Build

## Build front end


### for frontend setup
  in the bash of host
  * ```cd datacollector-ui```
  * ```npm i```
  * ```npm install -g bower```
  * ```npm install -g grunt-cli```
  * ```bower install```
 
  How to start:
  * ```grunt watch``` 
  

### for boot backend env
```docker-compose up``` 


## Build Deliverable

### Download core


	export SDC_VERSION="3.2.0.0-SNAPSHOT"	# check if downloaded
	curl -O http://nightly.streamsets.com.s3-us-west-2.amazonaws.com/datacollector/latest/tarball/streamsets-datacollector-core-${SDC_VERSION}.tgz
	tar -xvf streamsets-datacollector-core-${SDC_VERSION}.tgz 
	rm -Rf sdc
	mv streamsets-datacollector-${SDC_VERSION} dist
	cd dist 
	
	
### Remove unwanted libs

	rm -Rf streamsets-libs/streamsets-datacollector-dev-lib
	rm -Rf streamsets-libs/streamsets-datacollector-windows-lib
	rm -Rf streamsets-libs/streamsets-datacollector-stats-lib

### Add jdbc & mongodb lib

	cp -R ../streamsets-libs/  ./streamsets-libs
	
### Add driver jar

	cp -R ../streamsets-libs-extras/ ./streamsets-libs-extras/ 
	
### Replace sdc_web	
