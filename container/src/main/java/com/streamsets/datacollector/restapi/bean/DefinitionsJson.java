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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
import java.util.Map;
import java.util.Set;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DefinitionsJson {
  private List<PipelineDefinitionJson> pipeline;
  private List<PipelineFragmentDefinitionJson> pipelineFragment;
  private List<PipelineRulesDefinitionJson> pipelineRules;
  private List<StageDefinitionJson> stages;
  private List<ServiceDefinitionJson> services;
  private Map<String,Map<String, List<String>>> rulesElMetadata;
  private Map<String, Object> elCatalog;
  private Set<Object> runtimeConfigs;
  private Map<String, String> stageIcons;

  public List<PipelineDefinitionJson> getPipeline() {
    return pipeline;
  }

  public void setPipeline(List<PipelineDefinitionJson> pipeline) {
    this.pipeline = pipeline;
  }

  public List<PipelineFragmentDefinitionJson> getPipelineFragment() {
    return pipelineFragment;
  }

  public void setPipelineFragment(List<PipelineFragmentDefinitionJson> pipelineFragment) {
    this.pipelineFragment = pipelineFragment;
  }

  public List<StageDefinitionJson> getStages() {
    return stages;
  }

  public List<PipelineRulesDefinitionJson> getPipelineRules() {
    return pipelineRules;
  }

  public void setPipelineRules(List<PipelineRulesDefinitionJson> pipelineRules) {
    this.pipelineRules = pipelineRules;
  }

  public void setStages(List<StageDefinitionJson> stages) {
    this.stages = stages;
  }

  public Map<String,Map<String, List<String>>> getRulesElMetadata() {
    return rulesElMetadata;
  }

  public void setRulesElMetadata(Map<String,Map<String, List<String>>> rulesElMetadata) {
    this.rulesElMetadata = rulesElMetadata;
  }

  public Map<String, Object> getElCatalog() {
    return elCatalog;
  }

  public void setElCatalog(Map<String, Object> elCatalog) {
    this.elCatalog = elCatalog;
  }

  public Set<Object> getRuntimeConfigs() {
    return runtimeConfigs;
  }

  public void setRuntimeConfigs(Set<Object> runtimeConfigs) {
    this.runtimeConfigs = runtimeConfigs;
  }

  public Map<String, String> getStageIcons() {
    return stageIcons;
  }

  public void setStageIcons(Map<String, String> stageIcons) {
    this.stageIcons = stageIcons;
  }

  public List<ServiceDefinitionJson> getServices() {
    return services;
  }

  public void setServices(List<ServiceDefinitionJson> services) {
    this.services = services;
  }
}
