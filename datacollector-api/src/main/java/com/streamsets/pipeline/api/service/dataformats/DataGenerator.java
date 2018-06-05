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

import com.streamsets.pipeline.api.Record;

import java.io.Closeable;
import java.io.IOException;

public interface DataGenerator extends Closeable {

  /**
   * Write given record to the underlying stream.
   *
   * @param record Record to be serialized
   * @throws IOException Thrown when IO error is encountered
   * @throws DataGeneratorException Thrown when serialization issue occurs
   */
  public void write(Record record)  throws IOException, DataGeneratorException;

  /**
   * Flush all so far serialized record to the stream.
   *
   * Should be called by end of each batch to make sure that all data are serialized in
   * destination system.
   *
   * @throws IOException Thrown when IO error is encountered
   */
  public void flush() throws IOException;

  /**
   * Close underlying stream.
   *
   * Writing records after close will be disabled
   *
   * @throws IOException Thrown when IO error is encountered
   */
  @Override
  public void close() throws IOException;
}
