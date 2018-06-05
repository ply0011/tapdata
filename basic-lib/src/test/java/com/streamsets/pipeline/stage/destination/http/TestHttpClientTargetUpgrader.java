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
package com.streamsets.pipeline.stage.destination.http;

import com.streamsets.pipeline.api.Config;
import com.streamsets.pipeline.config.upgrade.UpgraderTestUtils;
import com.streamsets.pipeline.stage.util.tls.TlsConfigBeanUpgraderTestUtil;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

public class TestHttpClientTargetUpgrader {

  @Test
  public void testV1ToV2() throws Exception {
    TlsConfigBeanUpgraderTestUtil.testHttpSslConfigBeanToTlsConfigBeanUpgrade(
        "conf.client.",
        new HttpClientTargetUpgrader(),
        2
    );
  }

  @Test
  public void testV2ToV3() throws Exception {
    List<Config> configs = new ArrayList<>();

    HttpClientTargetUpgrader upgrader = new HttpClientTargetUpgrader();
    upgrader.upgrade("lib", "stage", "inst", 2, 3, configs);

    UpgraderTestUtils.assertAllExist(
        configs,
        "conf.client.requestLoggingConfig.enableRequestLogging",
        "conf.client.requestLoggingConfig.logLevel",
        "conf.client.requestLoggingConfig.verbosity",
        "conf.client.requestLoggingConfig.maxEntitySize"
    );
  }
}
