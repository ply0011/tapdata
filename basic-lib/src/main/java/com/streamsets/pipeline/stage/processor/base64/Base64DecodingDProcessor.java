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
package com.streamsets.pipeline.stage.processor.base64;

import com.streamsets.pipeline.api.ConfigDef;
import com.streamsets.pipeline.api.ConfigGroups;
import com.streamsets.pipeline.api.FieldSelectorModel;
import com.streamsets.pipeline.api.GenerateResourceBundle;
import com.streamsets.pipeline.api.Processor;
import com.streamsets.pipeline.api.StageDef;
import com.streamsets.pipeline.configurablestage.DProcessor;

@StageDef(
    version = 1,
    label = "Base64 Field Decoder",
    icon = "base64decoder.png",
    description = "Decodes a Base64 encoded Byte Array field",
    onlineHelpRefUrl ="index.html#datacollector/UserGuide/Processors/Base64Decoder.html#task_pnn_5py_kv"
)
@ConfigGroups(Groups.class)
@GenerateResourceBundle
public class Base64DecodingDProcessor extends DProcessor {

  @ConfigDef(
      required = true,
      type = ConfigDef.Type.MODEL,
      label = "Field to Decode",
      description = "Base64 encoded Byte Array field that is to be decoded",
      displayPosition = 10,
      group = "BASE64"
  )
  @FieldSelectorModel(singleValued = true)
  public String originFieldPath;

  @ConfigDef(
      required = true,
      type = ConfigDef.Type.STRING,
      label = "Target Field",
      description = "Target field to which decoded Byte Array is to be written to",
      displayPosition = 20,
      group = "BASE64"
  )
  public String resultFieldPath;

  @Override
  protected Processor createProcessor() {
    return new Base64DecodingProcessor(originFieldPath, resultFieldPath);
  }
}
