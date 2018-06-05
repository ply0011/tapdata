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

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class TestZonedDateTimeTypeSupport {

  @Test
  public void testCreate() {
    ZonedDateTimeTypeSupport ts = new ZonedDateTimeTypeSupport();
    ZonedDateTime o = ZonedDateTime.now();
    Assert.assertEquals(o, ts.create(o));
  }

  @Test
  public void testGet() {
    ZonedDateTimeTypeSupport ts = new ZonedDateTimeTypeSupport();
    ZonedDateTime o = ZonedDateTime.now();
    Assert.assertEquals(o, ts.get(o));
  }

  @Test
  public void testClone() {
    ZonedDateTimeTypeSupport ts = new ZonedDateTimeTypeSupport();
    ZonedDateTime o = ZonedDateTime.now();
    Assert.assertEquals(o, ts.clone(o));
  }

  @Test
  public void testConvertValid() throws Exception {
    ZonedDateTimeTypeSupport support = new ZonedDateTimeTypeSupport();
    ZonedDateTime d =
        ZonedDateTime.of(
            2014, 10, 22, 13, 30, 0, 0,
            ZoneId.of("Europe/Paris"));
    Assert.assertEquals(d, support.convert(d));
    Assert.assertEquals(d, support.convert(d.format(DateTimeFormatter.ISO_ZONED_DATE_TIME)));
    Assert.assertEquals(d.format(DateTimeFormatter.ISO_ZONED_DATE_TIME), new StringTypeSupport().convert(d));
    Assert.assertEquals(d, support.convert(new StringTypeSupport().convert(d)));
  }

  @Test(expected = IllegalArgumentException.class)
  public void testConvertInValid1() {
    new ZonedDateTimeTypeSupport().convert(new Exception());
  }

  @Test(expected = IllegalArgumentException.class)
  public void testConvertInValid2() {
    new ZonedDateTimeTypeSupport().convert("2014");
  }

}