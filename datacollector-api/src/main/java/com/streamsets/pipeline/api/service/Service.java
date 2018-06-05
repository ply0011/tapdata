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
package com.streamsets.pipeline.api.service;

import com.streamsets.pipeline.api.ConfigIssue;
import com.streamsets.pipeline.api.ProtoConfigurableEntity;

import java.util.List;

/**
 * Base interface for Data Collector services, a reusable and configurable code that stages can depend on to
 * outsource and share common functionality.
 */
public interface Service extends ProtoConfigurableEntity {

  /**
   * LineagePublisher Context that provides runtime information and services to the plugin.
   */
  public interface Context extends ProtoConfigurableEntity.Context {
  }

  /**
   * Initializes the service..
   *
   * This method is called once during start up of a pipeline.
   *
   * If the service returns an empty list of {@link ConfigIssue}s then it is considered ready to be used.
   *
   * Else it is considered it is mis-configured or that there is a non-recoverable problem and the service is
   * not ready to be used and hence pipeline initialization as a whole will fail.
   *
   * @param context the service context.
   */
  List<ConfigIssue> init(Context context);

  /**
   * Destroys the service. It should be used to release any resources held by the service after initialization or
   * processing.
   *
   * This method is called once when the pipeline is being shutdown. After this method is called, the service
   * will not be called any more.
   *
   * This method is also called after a failed initialization to allow releasing resources created before the
   * initialization failed.
   */
  void destroy();
}
