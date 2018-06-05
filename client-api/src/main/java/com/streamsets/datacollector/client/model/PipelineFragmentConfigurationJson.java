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
package com.streamsets.datacollector.client.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PipelineFragmentConfigurationJson {

  private Integer schemaVersion = null;
  private Integer version = null;
  private String fragmentId = null;
  private String fragmentInstanceId = null;
  private String uuid = null;
  private String title = null;
  private String description = null;
  private List<ConfigConfigurationJson> configuration = new ArrayList<>();
  private Map<String, Object> uiInfo = new HashMap<>();
  private List<StageConfigurationJson> stages = new ArrayList<>();
  private PipelineInfoJson info = null;
  private IssuesJson issues = null;
  private Boolean valid = null;
  private Boolean previewable = null;
  private Map<String, Object> metadata = new HashMap<>();
  private List<PipelineFragmentConfigurationJson> fragments = new ArrayList<>();

  public Integer getSchemaVersion() {
    return schemaVersion;
  }

  public void setSchemaVersion(Integer schemaVersion) {
    this.schemaVersion = schemaVersion;
  }

  public Integer getVersion() {
    return version;
  }

  public void setVersion(Integer version) {
    this.version = version;
  }

  public String getFragmentId() {
    return fragmentId;
  }

  public void setFragmentId(String fragmentId) {
    this.fragmentId = fragmentId;
  }

  public String getFragmentInstanceId() {
    return fragmentInstanceId;
  }

  public void setFragmentInstanceId(String fragmentInstanceId) {
    this.fragmentInstanceId = fragmentInstanceId;
  }

  public String getUuid() {
    return uuid;
  }

  public void setUuid(String uuid) {
    this.uuid = uuid;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public List<ConfigConfigurationJson> getConfiguration() {
    return configuration;
  }

  public void setConfiguration(List<ConfigConfigurationJson> configuration) {
    this.configuration = configuration;
  }

  public Map<String, Object> getUiInfo() {
    return uiInfo;
  }

  public void setUiInfo(Map<String, Object> uiInfo) {
    this.uiInfo = uiInfo;
  }

  public List<StageConfigurationJson> getStages() {
    return stages;
  }

  public void setStages(List<StageConfigurationJson> stages) {
    this.stages = stages;
  }

  public PipelineInfoJson getInfo() {
    return info;
  }

  public void setInfo(PipelineInfoJson info) {
    this.info = info;
  }

  public IssuesJson getIssues() {
    return issues;
  }

  public void setIssues(IssuesJson issues) {
    this.issues = issues;
  }

  public Boolean getValid() {
    return valid;
  }

  public void setValid(Boolean valid) {
    this.valid = valid;
  }

  public Boolean getPreviewable() {
    return previewable;
  }

  public void setPreviewable(Boolean previewable) {
    this.previewable = previewable;
  }

  public Map<String, Object> getMetadata() {
    return metadata;
  }

  public void setMetadata(Map<String, Object> metadata) {
    this.metadata = metadata;
  }

  public List<PipelineFragmentConfigurationJson> getFragments() {
    return fragments;
  }

  public void setFragments(List<PipelineFragmentConfigurationJson> fragments) {
    this.fragments = fragments;
  }
}
