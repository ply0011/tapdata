/*
 * Copyright 2018 StreamSets Inc.
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
package com.streamsets.pipeline.stage.processor.fieldreplacer.config;

import com.streamsets.pipeline.api.ConfigDef;
import com.streamsets.pipeline.api.ListBeanModel;
import com.streamsets.pipeline.api.ValueChooserModel;
import com.streamsets.pipeline.config.OnStagePreConditionFailure;
import com.streamsets.pipeline.config.OnStagePreConditionFailureChooserValues;

import java.util.List;

public class ReplacerConfigBean {

  @ConfigDef(
    required = true,
    type = ConfigDef.Type.MODEL,
    defaultValue = "CONTINUE",
    label = "Field Does Not Exist",
    description="Action for data that does not contain the specified fields",
    displayPosition = 10,
    group = "ADVANCED"
  )
  @ValueChooserModel(OnStagePreConditionFailureChooserValues.class)
  public OnStagePreConditionFailure onStagePreConditionFailure;

  @ConfigDef(
      required = true,
      type = ConfigDef.Type.MODEL,
      label = "Replacement rules",
      displayPosition = 10,
      group = "REPLACE"
  )
  @ListBeanModel
  public List<ReplaceRule> rules;
}
