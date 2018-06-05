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
package com.streamsets.pipeline.stage.origin.fragment;

import com.streamsets.pipeline.api.BatchMaker;
import com.streamsets.pipeline.api.ConfigDefBean;
import com.streamsets.pipeline.api.ExecutionMode;
import com.streamsets.pipeline.api.GenerateResourceBundle;
import com.streamsets.pipeline.api.HideConfigs;
import com.streamsets.pipeline.api.StageDef;
import com.streamsets.pipeline.api.base.BaseSource;
import com.streamsets.pipeline.lib.fragment.FragmentConfigBean;

@GenerateResourceBundle
@StageDef(
    version = 1,
    label = "Fragment Origin",
    icon = "fragment.png",
    execution = {
        ExecutionMode.STANDALONE,
        ExecutionMode.CLUSTER_BATCH,
        ExecutionMode.CLUSTER_YARN_STREAMING,
        ExecutionMode.CLUSTER_MESOS_STREAMING,
        ExecutionMode.EDGE
    },
    onlineHelpRefUrl =""
)
@HideConfigs(preconditions = true, onErrorRecord = true)
public class FragmentSource extends BaseSource {

  @ConfigDefBean
  public FragmentConfigBean conf = new FragmentConfigBean();

  @Override
  public String produce(String lastSourceOffset, int maxBatchSize, BatchMaker batchMaker) {
    return null;
  }
}
