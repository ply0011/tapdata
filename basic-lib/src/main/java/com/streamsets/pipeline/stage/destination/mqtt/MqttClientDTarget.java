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
package com.streamsets.pipeline.stage.destination.mqtt;

import com.streamsets.pipeline.api.ConfigDefBean;
import com.streamsets.pipeline.api.ConfigGroups;
import com.streamsets.pipeline.api.ExecutionMode;
import com.streamsets.pipeline.api.GenerateResourceBundle;
import com.streamsets.pipeline.api.HideConfigs;
import com.streamsets.pipeline.api.StageDef;
import com.streamsets.pipeline.api.Target;
import com.streamsets.pipeline.configurablestage.DTarget;
import com.streamsets.pipeline.lib.mqtt.Groups;
import com.streamsets.pipeline.lib.mqtt.MqttClientConfigBean;

@StageDef(
    version = 2,
    label = "MQTT Publisher",
    description = "Uses an MQTT Client to publish data to a topic on the MQTT Broker",
    icon = "mqtt.png",
    execution = {
        ExecutionMode.STANDALONE,
        ExecutionMode.CLUSTER_BATCH,
        ExecutionMode.CLUSTER_YARN_STREAMING,
        ExecutionMode.CLUSTER_MESOS_STREAMING,
        ExecutionMode.EDGE
    },
    recordsByRef = true,
    onlineHelpRefUrl ="index.html#datacollector/UserGuide/Destinations/MQTTPublisher.html#task_vbn_cyt_lz",
    upgrader = MqttClientTargetUpgrader.class
)
@ConfigGroups(Groups.class)
@HideConfigs({
    "commonConf.tlsConfig.keyStoreFilePath",
    "commonConf.tlsConfig.keyStoreType",
    "commonConf.tlsConfig.keyStorePassword",
    "commonConf.tlsConfig.keyStoreAlgorithm"
})
@GenerateResourceBundle
public class MqttClientDTarget extends DTarget {

  @ConfigDefBean
  public MqttClientConfigBean commonConf;

  @ConfigDefBean
  public MqttClientTargetConfigBean publisherConf;

  @Override
  protected Target createTarget() {
    return new MqttClientTarget(commonConf, publisherConf);
  }
}
