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
package com.streamsets.pipeline.stage.processor.splitter;

import com.streamsets.pipeline.api.ConfigDef;
import com.streamsets.pipeline.api.ConfigGroups;
import com.streamsets.pipeline.api.FieldSelectorModel;
import com.streamsets.pipeline.api.GenerateResourceBundle;
import com.streamsets.pipeline.api.Processor;
import com.streamsets.pipeline.api.StageDef;
import com.streamsets.pipeline.api.ValueChooserModel;
import com.streamsets.pipeline.config.OnStagePreConditionFailure;
import com.streamsets.pipeline.config.OnStagePreConditionFailureChooserValues;
import com.streamsets.pipeline.configurablestage.DProcessor;

import java.util.List;

@StageDef(
    version=2,
    label="Field Splitter",
    description = "Splits a string field based on a separator character",
    icon="splitter.png",
    onlineHelpRefUrl ="index.html#datacollector/UserGuide/Processors/FieldSplitter.html#task_av1_5g3_yq",
    upgrader = SplitterProcessorUpgrader.class
)
@ConfigGroups(Groups.class)
@GenerateResourceBundle
public class SplitterDProcessor extends DProcessor {

  @ConfigDef(
      required = true,
      type = ConfigDef.Type.MODEL,
      defaultValue = "",
      label = "Field to Split",
      description = "",
      displayPosition = 10,
      group = "FIELD_SPLITTER"
  )
  @FieldSelectorModel(singleValued = true)
  public String fieldPath;

  @ConfigDef(
      required = true,
      type = ConfigDef.Type.STRING,
      defaultValue = " ",
      label = "Separator",
      description = "Regular expression to use for splitting the field. If trying to split on a RegEx meta" +
          " character \".$|()[{^?*+\\\", the character must be escaped with \\",
      displayPosition = 20,
      group = "FIELD_SPLITTER"
  )
  public String separator;

  @ConfigDef(
      required = false,
      type = ConfigDef.Type.LIST,
      defaultValue = "[\"/fieldSplit1\", \"/fieldSplit2\"]",
      label = "New Split Fields",
      description="New fields to pass split data. The last field includes any remaining unsplit data.",
      displayPosition = 30,
      group = "FIELD_SPLITTER"
  )
  public List<String> fieldPathsForSplits;

  @ConfigDef(
      required = true,
      type = ConfigDef.Type.MODEL,
      defaultValue = "TO_ERROR",
      label = "Not Enough Splits",
      description="Action for data that has fewer splits than configured field paths",
      displayPosition = 40,
      group = "FIELD_SPLITTER"
  )
  @ValueChooserModel(OnStagePreConditionFailureChooserValues.class)
  public OnStagePreConditionFailure onStagePreConditionFailure;


  @ConfigDef(
      required = true,
      type = ConfigDef.Type.MODEL,
      defaultValue = "TO_LAST_FIELD",
      label = "Too Many Splits",
      description="Action for data that more splits than configured field paths",
      displayPosition = 50,
      group = "FIELD_SPLITTER"
  )
  @ValueChooserModel(TooManySplitsActionChooserValues.class)
  public TooManySplitsAction tooManySplitsAction;

  @ConfigDef(
      required = true,
      type = ConfigDef.Type.MODEL,
      defaultValue = "",
      label = "Field for Remaining Splits",
      description = "List field used to store any remaining splits",
      displayPosition = 55,
      dependsOn = "tooManySplitsAction",
      triggeredByValue = "TO_LIST",
      group = "FIELD_SPLITTER"
  )
  @FieldSelectorModel(singleValued = true)
  public String remainingSplitsPath;

  @ConfigDef(
      required = true,
      type = ConfigDef.Type.MODEL,
      defaultValue = "REMOVE",
      label = "Original Field",
      description="Action for the original field being split",
      displayPosition = 60,
      group = "FIELD_SPLITTER"
  )
  @ValueChooserModel(OriginalFieldActionChooserValues.class)
  public OriginalFieldAction originalFieldAction;

  @Override
  protected Processor createProcessor() {
    return new SplitterProcessor(fieldPath, separator, fieldPathsForSplits, tooManySplitsAction, remainingSplitsPath,
                                 onStagePreConditionFailure, originalFieldAction);
  }

}
