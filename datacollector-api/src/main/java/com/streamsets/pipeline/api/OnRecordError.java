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
package com.streamsets.pipeline.api;


/**
 * Enumeration defining the error record handling for stages via the built-in 'on record error' configuration.
 */
// we are using the annotation for reference purposes only.
// the annotation processor does not work on this maven project
// we have a hardcoded 'datacollector-resource-bundles.json' file in resources
@GenerateResourceBundle
public enum OnRecordError implements Label {
  DISCARD("Discard"),
  TO_ERROR("Send to Error"),
  STOP_PIPELINE("Stop Pipeline"),
  ;

  private final String label;

  OnRecordError(String label) {
    this.label = label;
  }

  @Override
  public String getLabel() {
    return label;
  }

}
