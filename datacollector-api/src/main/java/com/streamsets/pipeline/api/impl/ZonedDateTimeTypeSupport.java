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

import com.streamsets.pipeline.api.base.Errors;

import java.time.ZonedDateTime;
import java.time.format.DateTimeParseException;

import static com.streamsets.pipeline.api.base.Errors.API_25;

public class ZonedDateTimeTypeSupport extends TypeSupport<ZonedDateTime> {
  @Override
  public ZonedDateTime convert(Object value) {
    if (value instanceof ZonedDateTime) {
      return (ZonedDateTime) value;
    }

    // We don't use ZonedDateTime.toString() to convert to String, since it requires offset and ID to be the same,
    // We convert to String using DateTimeFormatter.ISO_ZONED_DATE_TIME (which is default for this method, but passed
    // in explicitly for clarity)
    try {
      Utils.checkArgument(
          value instanceof String,
          Utils.format(API_25.getMessage(), value.getClass().getSimpleName(), value)
      );
      return Utils.parseZoned((String) value);
    } catch (DateTimeParseException ex) {
      throw new IllegalArgumentException(Utils.format(Errors.API_26.getMessage(), value));
    }
  }


  @Override
  public Object create(Object value) {
    return clone(value);
  }

  @Override
  public Object get(Object value) {
    return clone(value);
  }

  @Override
  public Object clone(Object value) {
    // ZonedDateTime instances are immutable
    return value;
  }

}
