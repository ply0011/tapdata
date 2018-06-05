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

public class DoubleTypeSupport extends TypeSupport<Double> {

  @Override
  public Double convert(Object value) {
    if (value instanceof Double) {
      return (Double) value;
    }
    if (value instanceof String) {
      return Double.parseDouble((String) value);
    }
    if (value instanceof Short) {
      return ((Short)value).doubleValue();
    }
    if (value instanceof Integer) {
      return ((Integer)value).doubleValue();
    }
    if (value instanceof Byte) {
      return ((Byte)value).doubleValue();
    }
    if (value instanceof Long) {
      return ((Long)value).doubleValue();
    }
    if (value instanceof Float) {
      return ((Float)value).doubleValue();
    }
    if (value instanceof Number) {
      return ((Number)value).doubleValue();
    }
    throw new IllegalArgumentException(Utils.format(Errors.API_09.getMessage(),
                                                    value.getClass().getSimpleName(), value));
  }

}
