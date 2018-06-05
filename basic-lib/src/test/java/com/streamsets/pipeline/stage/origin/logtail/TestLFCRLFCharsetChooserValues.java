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
package com.streamsets.pipeline.stage.origin.logtail;

import com.streamsets.pipeline.config.CharsetChooserValues;
import org.junit.Assert;
import org.junit.Test;

import java.util.HashSet;
import java.util.Set;

public class TestLFCRLFCharsetChooserValues {

  @Test
  public void testChooserValues() {
    CharsetChooserValues ccv = new LFCRLFCharsetChooserValues();
    Set<String> charsets = new HashSet<>(ccv.getValues());
    Assert.assertTrue(charsets.contains("UTF-8"));
    Assert.assertFalse(charsets.contains("UTF-16"));
  }
}
