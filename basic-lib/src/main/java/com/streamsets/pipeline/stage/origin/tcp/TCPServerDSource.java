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
package com.streamsets.pipeline.stage.origin.tcp;

import com.streamsets.pipeline.api.ConfigDefBean;
import com.streamsets.pipeline.api.ConfigGroups;
import com.streamsets.pipeline.api.ExecutionMode;
import com.streamsets.pipeline.api.GenerateResourceBundle;
import com.streamsets.pipeline.api.HideConfigs;
import com.streamsets.pipeline.api.PushSource;
import com.streamsets.pipeline.api.StageDef;
import com.streamsets.pipeline.api.impl.Utils;
import com.streamsets.pipeline.configurablestage.DPushSource;

@StageDef(
    version = 2,
    label = "TCP Server",
    description = "Listens for TCP messages on one or more ports",
    icon = "ethernet_multithreaded.png",
    execution = ExecutionMode.STANDALONE,
    recordsByRef = true,
    upgrader = TCPServerSourceUpgrader.class,
    onlineHelpRefUrl ="index.html#datacollector/UserGuide/Origins/TCPServer.html#task_w2y_yb1_4z"
)

@ConfigGroups(Groups.class)
@HideConfigs({
    "conf.tlsConfigBean.trustStoreFilePath",
    "conf.tlsConfigBean.trustStoreType",
    "conf.tlsConfigBean.trustStorePassword",
    "conf.tlsConfigBean.trustStoreAlgorithm"
})
@GenerateResourceBundle
public class TCPServerDSource extends DPushSource {

  @ConfigDefBean
  public TCPServerSourceConfig conf;

  @Override
  protected PushSource createPushSource() {
    Utils.checkNotNull(conf.tcpMode, "Data format cannot be null");
    Utils.checkNotNull(conf.ports, "Ports cannot be null");

    return new TCPServerSource(conf);
  }
}
