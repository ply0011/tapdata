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
package com.streamsets.pipeline.api.impl;

import org.junit.Assert;
import org.junit.Test;

public class TestCharTypeSupport {

  @Test
  public void testCreate() {
    CharTypeSupport ts = new CharTypeSupport();
    char o = 'c';
    Assert.assertSame(o, ts.create(o));
  }

  @Test
  public void testGet() {
    CharTypeSupport ts = new CharTypeSupport();
    char o = 'c';
    Assert.assertSame(o, ts.get(o));
  }

  @Test
  public void testClone() {
    CharTypeSupport ts = new CharTypeSupport();
    char o = 'c';
    Assert.assertSame(o, ts.clone(o));
  }

  @Test
  public void testConvertValid() {
    CharTypeSupport support = new CharTypeSupport();
    Assert.assertEquals(new Character('c'), support.convert('c'));
    Assert.assertEquals(new Character('c'), support.convert("c"));
    Assert.assertEquals(new Character('c'), support.convert("cX"));
  }

  @Test(expected = IllegalArgumentException.class)
  public void testConvertInValid1() {
    new CharTypeSupport().convert(new Exception());
  }

  @Test(expected = IllegalArgumentException.class)
  public void testConvertInValid2() {
    new CharTypeSupport().convert("");
  }

}
