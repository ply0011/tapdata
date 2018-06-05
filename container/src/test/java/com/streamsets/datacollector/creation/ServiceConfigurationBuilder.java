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
package com.streamsets.datacollector.creation;

import com.streamsets.datacollector.config.ServiceConfiguration;
import com.streamsets.pipeline.api.Config;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ServiceConfigurationBuilder {
  private Class service = Runnable.class;
  private int serviceVersion = 1 ;
  private List<Config> configuration = Collections.emptyList();

  public ServiceConfigurationBuilder() {
  }

  public ServiceConfigurationBuilder withService(Class service) {
    this.service = service;
    return this;
  }

  public ServiceConfigurationBuilder withServiceVersion(int version) {
    this.serviceVersion = version;
    return this;
  }


  public ServiceConfigurationBuilder withConfig(Config ...configs) {
    this.configuration = Arrays.asList(configs);
    return this;
  }


  public ServiceConfiguration build() {
    return new ServiceConfiguration(
      service,
      serviceVersion,
      configuration
    );
  }
}
