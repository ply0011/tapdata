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
package com.streamsets.pipeline.api.base;

import com.streamsets.pipeline.api.ConfigIssue;
import com.streamsets.pipeline.api.service.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public abstract class BaseService implements Service {

  private Service.Context context;

  /**
   * Initializes the service.
   *
   * Stores the <code>Service.Context</code> in instance variables and calls the {@link #init()} method.
   *
   * @param context Service context.
   * @return The list of configuration issues found during initialization, an empty list if none.
   */
  @Override
  public List<ConfigIssue> init(Service.Context context) {
    this.context = context;
    return init();
  }

  /**
   * Initializes the stage. Subclasses should override this method for service initialization.
   *
   * This implementation is a no-operation.
   *
   * @return The list of configuration issues found during initialization, an empty list if none.
   */
  protected List<ConfigIssue> init() {
    return new ArrayList<>();
  }

  /**
   * Returns the service context passed by the Data Collector during initialization.
   *
   * @return Service context passed by the Data Collector during initialization.
   */
  protected Service.Context getContext() {
    return context;
  }

  /**
   * Destroy the service. Subclasses should override this method for stage cleanup.
   *
   * This implementation is a no-operation.
   */
  @Override
  public void destroy() {
  }
}
