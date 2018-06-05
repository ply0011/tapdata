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

public class TestTypeSupport {

  public static class TTypeSupport extends TypeSupport<Object> {
    @Override
    public Object convert(Object value) {
      return value;
    }
  }

  @Test
  public void testCreate() {
    TypeSupport tt = new TTypeSupport();
    Object o = new Object();
    Assert.assertSame(o, tt.create(o));
  }

  @Test
  public void testGet() {
    TypeSupport tt = new TTypeSupport();
    Object o = new Object();
    Assert.assertSame(o, tt.get(o));
  }

  @Test
  public void testClone() {
    TypeSupport tt = new TTypeSupport();
    Object o = new Object();
    Assert.assertSame(o, tt.clone(o));
  }

}
