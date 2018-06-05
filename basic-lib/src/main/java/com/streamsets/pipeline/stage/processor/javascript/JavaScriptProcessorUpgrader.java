/*
 * Copyright 2017 StreamSets Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.streamsets.pipeline.stage.processor.javascript;

import com.streamsets.pipeline.api.Config;
import com.streamsets.pipeline.api.StageException;
import com.streamsets.pipeline.api.StageUpgrader;
import com.streamsets.pipeline.api.impl.Utils;

import java.util.ArrayList;
import java.util.List;

public class JavaScriptProcessorUpgrader implements StageUpgrader {
  List<Config> configsToRemove = new ArrayList<>();
  List<Config> configsToAdd = new ArrayList<>();

  @Override
  public List<Config> upgrade(String library, String stageName, String stageInstance, int fromVersion, int toVersion, List<Config> configs) throws StageException {
    switch(fromVersion) { // NOSONAR
      case 1:
        upgradeV1ToV2(configs);
        break;
      default:
        throw new IllegalStateException(Utils.format("Unexpected fromVersion {}", fromVersion));
    }
    return configs;
  }

  private void upgradeV1ToV2(List<Config> configs) {
    for (Config config : configs) {
      if ("script".equals(config.getName())) {
        String script = (String) config.getValue();
        script = script.replaceAll("out\\.write", "output.write");
        script = script.replaceAll("err\\.write", "error.write");
        configsToAdd.add(new Config(config.getName(), script));
        configsToRemove.add(config);
        break;
      }
    }

    configs.removeAll(configsToRemove);
    configs.addAll(configsToAdd);
  }
}
