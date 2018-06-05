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
package com.streamsets.datacollector.http;

import com.codahale.metrics.MetricRegistry;
import com.google.common.collect.ImmutableSet;
import com.streamsets.datacollector.activation.NopActivation;
import com.streamsets.datacollector.main.DataCollectorBuildInfo;
import com.streamsets.datacollector.main.RuntimeInfo;
import com.streamsets.datacollector.main.RuntimeModule;
import com.streamsets.datacollector.main.StandaloneRuntimeInfo;
import com.streamsets.datacollector.util.Configuration;
import com.streamsets.lib.security.http.RemoteSSOService;
import org.eclipse.jetty.server.ForwardedRequestCustomizer;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.util.thread.ThreadPool;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;

import java.io.File;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class TestWebServerTask {


  private WebServerTask createWebServerTask(
      final String confDir,
      final Configuration conf,
      final Set<WebAppProvider> webAppProviders,
      boolean isDPMEnabled
  ) throws Exception {
    RuntimeInfo runtimeInfo =
        new StandaloneRuntimeInfo(RuntimeModule.SDC_PROPERTY_PREFIX, new MetricRegistry(), Collections
            .<ClassLoader>emptyList()) {
          @Override
          public String getConfigDir() {
            return confDir;
          }
        };
    runtimeInfo.setDPMEnabled(isDPMEnabled);
    return createWebServerTask(runtimeInfo, conf, webAppProviders);
  }

  @SuppressWarnings("unchecked")
  private WebServerTask createWebServerTask(
        RuntimeInfo runtimeInfo,
      final Configuration conf,
      final Set<WebAppProvider> webAppProviders
  ) throws Exception {
    Set<ContextConfigurator> configurators = new HashSet<>();
    return new WebServerTask(new DataCollectorBuildInfo(),
        runtimeInfo,
        conf,
        new NopActivation(),
        configurators,
        webAppProviders
    ) {
      @Override
      protected String getAppAuthToken(Configuration appConfiguration) {
        return "applicationToken";
      }

      @Override
      protected String getComponentId(Configuration appConfiguration) {
        return "componentId";
      }
    };
  }

  @Test
  public void testConfigurationInitialization() throws Exception {
    Configuration serverConf = new Configuration();
    final Configuration appConf = new Configuration();

    WebAppProvider webAppProvider = new WebAppProvider() {
      @Override
      public Configuration getAppConfiguration() {
        return appConf;
      }

      @Override
      public ServletContextHandler get() {
        ServletContextHandler handler = new ServletContextHandler();
        handler.setContextPath("/foo");
        return handler;
      }

      @Override
      public void postStart() {

      }
    };


    WebServerTask webServerTask =
        createWebServerTask(new File("target").getAbsolutePath(), serverConf, ImmutableSet.of(webAppProvider), false);
    webServerTask = Mockito.spy(webServerTask);

    try {
      webServerTask.initTask();
      Mockito.verify(webServerTask, Mockito.times(1)).createSecurityHandler(Mockito.<Server>any(), Mockito.eq
              (serverConf),
          Mockito.<ServletContextHandler>any(),Mockito.eq("/"));
      Mockito.verify(webServerTask, Mockito.times(1)).createSecurityHandler(Mockito.<Server>any(), Mockito.eq
              (appConf),
          Mockito.<ServletContextHandler>any(),Mockito.eq("/foo"));
    } finally {
      webServerTask.stopTask();
    }
  }

  @Test
  public void testInjectionOfComponentIdAndAppToken() throws Exception {
    Configuration serverConf = new Configuration();
    serverConf.set(RemoteSSOService.SECURITY_SERVICE_APP_AUTH_TOKEN_CONFIG, "applicationToken");

    WebServerTask webServerTask =
        createWebServerTask(new File("target").getAbsolutePath(), serverConf, Collections.<WebAppProvider>emptySet(),
            true);
    webServerTask = Mockito.spy(webServerTask);

    RemoteSSOService ssoService = Mockito.mock(RemoteSSOService.class);
    Mockito.doReturn(ssoService).when(webServerTask).createRemoteSSOService(Mockito.<Configuration>any());

    try {
      webServerTask.initTask();
      Mockito.verify(ssoService, Mockito.times(1)).setApplicationAuthToken(Mockito.eq("applicationToken"));
      Mockito.verify(ssoService, Mockito.times(1)).setComponentId(Mockito.eq("componentId"));
    } finally {
      webServerTask.stopTask();
    }
  }

  @Test
  public void testThreadPool() throws Exception {
    Configuration serverConf = new Configuration();
    serverConf.set(WebServerTask.HTTP_MAX_THREADS, 100);

    WebServerTask webServerTask = createWebServerTask(new File("target").getAbsolutePath(),
        serverConf,
        Collections.<WebAppProvider>emptySet(),
        true
    );
    try {
      webServerTask.initTask();
      Server server = webServerTask.getServer();
      assertEquals(100, ((ThreadPool.SizedThreadPool)server.getThreadPool()).getMaxThreads());
    } finally {
      webServerTask.stopTask();
    }

  }

  @Test
  public void testSSOServiceInRuntime() throws Exception {
    RuntimeInfo runtimeInfo =
        new StandaloneRuntimeInfo(RuntimeModule.SDC_PROPERTY_PREFIX, new MetricRegistry(), Collections
            .<ClassLoader>emptyList()) {
          @Override
          public String getConfigDir() {
            return new File("target").getAbsolutePath();
          }
        };
    runtimeInfo.setDPMEnabled(true);


    Assert.assertNull(runtimeInfo.getAttribute(WebServerTask.SSO_SERVICES_ATTR));

    Configuration conf = new Configuration();

    WebServerTask webServerTask = createWebServerTask(runtimeInfo, conf, Collections.<WebAppProvider>emptySet());
    try {
      webServerTask.initTask();
    } finally {
      webServerTask.stopTask();
    }

    Assert.assertNotNull(runtimeInfo.getAttribute(WebServerTask.SSO_SERVICES_ATTR));

    Object attr = runtimeInfo.getAttribute(WebServerTask.SSO_SERVICES_ATTR);
    assertEquals(1, ((List)attr).size());

    webServerTask = createWebServerTask(runtimeInfo, conf, Collections.<WebAppProvider>emptySet());
    try {
      webServerTask.initTask();
    } finally {
      webServerTask.stopTask();
    }

    assertEquals(attr, runtimeInfo.getAttribute(WebServerTask.SSO_SERVICES_ATTR));
    assertEquals(2, ((List)attr).size());

  }

  @Test
  public void testForwardRequestCustomizerConfiguration() throws Exception {
    final Configuration appConf = new Configuration();

    WebAppProvider webAppProvider = new WebAppProvider() {
      @Override
      public Configuration getAppConfiguration() {
        return appConf;
      }

      @Override
      public ServletContextHandler get() {
        ServletContextHandler handler = new ServletContextHandler();
        handler.setContextPath("/bar");
        return handler;
      }

      @Override
      public void postStart() {

      }
    };

    Configuration taskConf = new Configuration();
    WebServerTask webServerTask = createWebServerTask(
        new File("target").getAbsolutePath(),
        taskConf,
        ImmutableSet.of(webAppProvider),
        false
    );
    webServerTask = Mockito.spy(webServerTask);

    try {
      webServerTask.initTask();
      Mockito.verify(webServerTask, Mockito.times(1))
          .configureForwardRequestCustomizer(Mockito.<HttpConfiguration>any());

      assertFalse(hasForwardedRequestCustomizer(webServerTask.getHttpConf()));
    } finally {
      webServerTask.stopTask();
    }

    taskConf.set(WebServerTask.HTTP_ENABLE_FORWARDED_REQUESTS_KEY, true);
    webServerTask = createWebServerTask(
        new File("target").getAbsolutePath(),
        taskConf,
        ImmutableSet.of(webAppProvider),
        false
    );
    webServerTask = Mockito.spy(webServerTask);
    try {
      webServerTask.initTask();
      Mockito.verify(webServerTask, Mockito.times(1))
          .configureForwardRequestCustomizer(Mockito.<HttpConfiguration>any());

      assertTrue(hasForwardedRequestCustomizer(webServerTask.getHttpConf()));
    } finally {
      webServerTask.stopTask();
    }

  }

  private boolean hasForwardedRequestCustomizer(HttpConfiguration conf) {
    boolean hasForwardedRequestCustomizer = false;
    for (HttpConfiguration.Customizer customizer : conf.getCustomizers()) {
      if (customizer instanceof ForwardedRequestCustomizer) {
        hasForwardedRequestCustomizer = true;
        break;
      }
    }
    return hasForwardedRequestCustomizer;
  }

}
