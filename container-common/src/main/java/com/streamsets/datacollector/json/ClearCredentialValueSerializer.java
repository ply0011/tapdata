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
package com.streamsets.datacollector.json;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.streamsets.datacollector.credential.ClearCredentialValue;

import java.io.IOException;

class ClearCredentialValueSerializer extends StdSerializer<ClearCredentialValue> {

  public ClearCredentialValueSerializer() {
    this(null);
  }

  public ClearCredentialValueSerializer(Class<ClearCredentialValue> t) {
    super(t);
  }

  @Override
  public void serialize(
    ClearCredentialValue clearCredentialValue,
    JsonGenerator jsonGenerator,
    SerializerProvider serializerProvider
  ) throws IOException {
    jsonGenerator.writeString(clearCredentialValue.get());
  }
}
