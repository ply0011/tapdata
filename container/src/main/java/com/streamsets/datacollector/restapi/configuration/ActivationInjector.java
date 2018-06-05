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
package com.streamsets.datacollector.restapi.configuration;

import com.streamsets.datacollector.activation.Activation;
import org.glassfish.hk2.api.Factory;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;

public class ActivationInjector implements Factory<Activation> {
  public static final String ACTIVATION = "activation";
  private Activation activation;

  @Inject
  public ActivationInjector(HttpServletRequest request) {
    activation = (Activation) request.getServletContext().getAttribute(ACTIVATION);
  }

  @Override
  public Activation provide() {
    return activation;
  }

  @Override
  public void dispose(Activation activation) {
  }

}
