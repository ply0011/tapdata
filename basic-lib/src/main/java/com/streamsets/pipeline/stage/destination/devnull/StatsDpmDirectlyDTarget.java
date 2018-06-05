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
package com.streamsets.pipeline.stage.destination.devnull;

import com.streamsets.pipeline.api.ExecutionMode;
import com.streamsets.pipeline.api.GenerateResourceBundle;
import com.streamsets.pipeline.api.HideConfigs;
import com.streamsets.pipeline.api.StageDef;
import com.streamsets.pipeline.api.StatsAggregatorStage;

@StageDef(
    version = 1,
    label = "Write to Control Hub directly",
    description = "Writes pipeline statistics to Control Hub directly without any aggregation",
    icon="",
    execution = {
        ExecutionMode.STANDALONE,
        ExecutionMode.EDGE
    },
    onlineHelpRefUrl = ""
)
@HideConfigs(preconditions = true, onErrorRecord = true)
@StatsAggregatorStage
@GenerateResourceBundle
public class StatsDpmDirectlyDTarget extends NullDTarget {
}
