<!---
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. See accompanying LICENSE file.
--->

<img style="width:100%;" src="/github-banner.png">

[StreamSets](http://streamsets.com)

# Building StreamSets Data Collector

To build the Data Collector you will need the following software :

- Git 1.9+
- JDK 1.7.*
- Maven 3.2.3+

Follow these instructions to build the Data Collector :

- Get the latest code from github

`git clone http://github.com/streamsets/datacollector-api`

## Build

From within the DataCollector API directory, execute:

`mvn clean package`

## Install it locally

From within the DataCollector API directory, execute:

`mvn clean install`
