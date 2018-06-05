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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.streamsets.datacollector.record.RecordImpl;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RecordJson {

  private final RecordImpl record;

  public RecordJson(RecordImpl record) {
    this.record = record;
  }

  @JsonCreator
  public RecordJson(@JsonProperty("header") HeaderJson headerJson,
                    @JsonProperty("value") FieldJson value) {
    record = new RecordImpl(BeanHelper.unwrapHeader(headerJson), BeanHelper.unwrapField(value));
  }

  public HeaderJson getHeader() {return new HeaderJson(record.getHeader());}

  public Object getValue() {
    return record.getValue();
  }

  @JsonIgnore
  public RecordImpl getRecord() {
    return record;
  }
}
