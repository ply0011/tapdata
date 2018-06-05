/**
 * Copyright 2018 StreamSets Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.streamsets.datacollector.cluster;

import com.streamsets.datacollector.main.RuntimeInfo;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ClusterLogConfigUtils {

  public static final String LOG4J_LOGGER = "log4j.logger";

  public static List<String> getLogContent(RuntimeInfo runtimeInfo, String clusterLogFile) throws IOException,
  URISyntaxException {
    List<String> log4JloggerLines = new ArrayList<>();
    List<String> allLogLines = new ArrayList<>();
    try (BufferedReader bufferedReader = new BufferedReader(new FileReader(new File(runtimeInfo.getConfigDir(),
        runtimeInfo.getLog4jPropertiesFileName()
    )))) {
      log4JloggerLines.addAll(bufferedReader.lines().filter(line -> line.trim().startsWith(LOG4J_LOGGER)).collect(
          Collectors.toList()));
    }
    try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(ClusterLogConfigUtils.class
        .getResourceAsStream(
        clusterLogFile)))) {
      allLogLines.addAll(bufferedReader.lines().collect(Collectors.toList()));
      allLogLines.addAll(log4JloggerLines);
    }
    return allLogLines;
  }
}
