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
package com.streamsets.pipeline.stage.origin.coapserver;

import com.streamsets.pipeline.api.ConfigDef;
import com.streamsets.pipeline.api.ConfigDefBean;
import com.streamsets.pipeline.api.ConfigGroups;
import com.streamsets.pipeline.api.ExecutionMode;
import com.streamsets.pipeline.api.GenerateResourceBundle;
import com.streamsets.pipeline.api.HideConfigs;
import com.streamsets.pipeline.api.PushSource;
import com.streamsets.pipeline.api.StageDef;
import com.streamsets.pipeline.api.ValueChooserModel;
import com.streamsets.pipeline.config.DataFormat;
import com.streamsets.pipeline.configurablestage.DPushSource;
import com.streamsets.pipeline.lib.coap.Groups;
import com.streamsets.pipeline.stage.origin.lib.DataParserFormatConfig;

@StageDef(
    version = 1,
    label = "CoAP Server",
    description = "Listens for requests on a CoAP endpoint",
    icon="coap_multithreaded.png",
    execution = {ExecutionMode.STANDALONE},
    recordsByRef = true,
    onlineHelpRefUrl ="index.html#datacollector/UserGuide/Origins/CoAPServer.html#task_hsb_l3n_sz"
)
@ConfigGroups(Groups.class)
@HideConfigs(value = {
    "dataFormatConfig.verifyChecksum",
    "dataFormatConfig.avroSchemaSource"
})
@GenerateResourceBundle
public class CoapServerDPushSource extends DPushSource {

  @ConfigDefBean(groups = "COAP")
  public CoapServerConfigs coAPServerConfigs;

  @ConfigDef(
      required = true,
      type = ConfigDef.Type.MODEL,
      label = "Data Format",
      description = "HTTP payload data format",
      displayPosition = 1,
      group = "DATA_FORMAT"
  )
  @ValueChooserModel(DataFormatChooserValues.class)
  public DataFormat dataFormat;

  @ConfigDefBean(groups = "DATA_FORMAT")
  public DataParserFormatConfig dataFormatConfig = new DataParserFormatConfig();

  @Override
  protected PushSource createPushSource() {
    return new CoapServerPushSource(coAPServerConfigs, dataFormat, dataFormatConfig);
  }

}
