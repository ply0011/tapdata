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

import com.streamsets.pipeline.api.FileRef;
import com.streamsets.pipeline.api.base.Errors;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

public class StringTypeSupport extends TypeSupport<String> {

  @Override
  public String convert(Object value) {
    if(value instanceof Map || value instanceof List || value instanceof byte[]|| value instanceof FileRef) {
      throw new IllegalArgumentException(Utils.format(Errors.API_18.getMessage()));
    }
    // ZoneDatetime.toString() does not use a standard format which can be parsed.
    if (value instanceof ZonedDateTime) {
      return Utils.format((ZonedDateTime) value);
    }

    return value.toString();
  }

}
