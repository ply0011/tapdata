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
package com.streamsets.pipeline.api.service.dataformats;

import java.io.IOException;
import java.io.OutputStream;

/**
 * Service that allows serializing records to various file formats.
 */
public interface DataFormatGeneratorService {

  /**
   * Retrieve DataGenerator for given output stream.
   *
   * @param os Underlying OutputStream where data will be written
   * @return Returns new instance of DataGenerator
   * @throws IOException Thrown when IO error is encountered
   */
  public DataGenerator getGenerator(OutputStream os) throws IOException;

  /**
   * Returns true if the generated data are plain text (e.g. formats like CSV or JSON and not Avro or Protobuf). Usable
   * if the stage wants to behave differently for text formats (better user exceptions, ...).
   */
  public boolean isPlainTextCompatible();

  /**
   * Charset that is used by the service when writing text data.
   *
   * Particularly useful when the output of the service is a text and charset needs to be passed down to the target
   * system. This method does not make sense when using a binary format (e.g. when isPlainTextCompatible returns false).
   */
  public String getCharset();
}
