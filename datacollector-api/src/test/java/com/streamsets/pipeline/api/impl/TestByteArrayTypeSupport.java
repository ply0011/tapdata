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

public class TestByteArrayTypeSupport {

  @Test
  public void testCreate() {
    ByteArrayTypeSupport ts = new ByteArrayTypeSupport();
    byte[] array = new byte[0];
    Assert.assertArrayEquals(array, (byte[])ts.create(array));
    Assert.assertNotSame(array, ts.create(array));
  }

  @Test
  public void testGet() {
    ByteArrayTypeSupport ts = new ByteArrayTypeSupport();
    byte[] array = new byte[0];
    Assert.assertArrayEquals(array, (byte[])ts.get(array));
    Assert.assertNotSame(array, ts.get(array));
  }

  @Test
  public void testClone() {
    ByteArrayTypeSupport ts = new ByteArrayTypeSupport();
    byte[] array = new byte[0];
    Assert.assertArrayEquals(array, (byte[])ts.clone(array));
    Assert.assertNotSame(array, ts.clone(array));
  }

  @Test
  public void testConvertValid() throws Exception {
    ByteArrayTypeSupport support = new ByteArrayTypeSupport();
    byte[] array = new byte[0];
    Assert.assertArrayEquals(array, support.convert(array));
  }

  @Test(expected = IllegalArgumentException.class)
  public void testConvertInValid() {
    new ByteArrayTypeSupport().convert(new Exception());
  }

}
