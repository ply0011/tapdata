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
import java.util.ArrayList;
import java.util.List;

public interface DataParser extends Closeable {

  /**
   * Parse next record.
   *
   * @return Next parsed record or NULL if EOF
   * @throws IOException Thrown when IO error is encountered
   * @throws DataParserException Thrown when serialization issue occurs
   */
  public Record parse() throws IOException, DataParserException;

  /**
   * Parse all records from the stream.
   *
   * Particularly useful when input it small and bounded (such as when parsing another existing field).
   *
   * @return List of parsed records or empty list if no records were found.
   * @throws IOException Thrown when IO error is encountered
   * @throws DataParserException Thrown when serialization issue occurs
   */
  default public List<Record> parseAll() throws IOException, DataParserException {
    List<Record> records = new ArrayList<>();
    Record r;
    while((r = parse()) != null) {
      records.add(r);
    }
    return records;
  }

  /**
   * Return offset in the stream (how many bytes were read until now).
   *
   * @return Offset in the current stream or -1 if EOF has been reached
   * @throws IOException Thrown when IO error is encountered
   * @throws DataParserException Thrown when serialization issue occurs
   */
  public String getOffset() throws DataParserException, IOException;

  /**
   * Indicate to the parse that a truncated input has been detected.
   */
  public void setTruncated();

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

