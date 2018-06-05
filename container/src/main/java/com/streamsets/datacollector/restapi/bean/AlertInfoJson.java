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
package com.streamsets.datacollector.restapi.bean;

import com.codahale.metrics.Gauge;
import com.streamsets.datacollector.execution.alerts.AlertInfo;
import com.streamsets.datacollector.config.RuleDefinition;

public class AlertInfoJson {
  private final AlertInfo alertInfo;

  public AlertInfoJson(AlertInfo alertInfo) {
    this.alertInfo = alertInfo;
  }

  public String getPipelineName() {
    return alertInfo.getPipelineName();
  }

  public RuleDefinition getRuleDefinition() {
    return alertInfo.getRuleDefinition();
  }

  public Gauge getGauge() {
    return alertInfo.getGauge();
  }

}
