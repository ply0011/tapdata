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

import java.math.BigDecimal;
import java.util.Date;

public class TestLongTypeSupport {

  @Test
  public void testCreate() {
    LongTypeSupport ts = new LongTypeSupport();
    long o = 1;
    Assert.assertSame(o, ts.create(o));
  }

  @Test
  public void testGet() {
    LongTypeSupport ts = new LongTypeSupport();
    long o = 1;
    Assert.assertSame(o, ts.get(o));
  }

  @Test
  public void testClone() {
    LongTypeSupport ts = new LongTypeSupport();
    long o = 1;
    Assert.assertSame(o, ts.clone(o));
  }

  @Test
  public void testConvertValid() {
    LongTypeSupport support = new LongTypeSupport();
    Assert.assertEquals(new Long(1), support.convert("1"));
    Assert.assertEquals(new Long(1), support.convert((byte)1));
    Assert.assertEquals(new Long(1), support.convert((short)1));
    Assert.assertEquals(new Long(1), support.convert((int)1));
    Assert.assertEquals(new Long(1), support.convert((long)1));
    Assert.assertEquals(new Long(1), support.convert((float)1));
    Assert.assertEquals(new Long(1), support.convert((double)1));
    Assert.assertEquals(new Long(1), support.convert(new BigDecimal(1)));
    Assert.assertEquals(new Long(67264872), support.convert(new Date(67264872)));
  }

  @Test(expected = IllegalArgumentException.class)
  public void testConvertInValid() {
    LongTypeSupport support = new LongTypeSupport();
    new LongTypeSupport().convert(new Exception());
  }

}
