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

import com.streamsets.pipeline.api.FileRef;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.Reader;
import java.io.StringReader;
import java.util.Map;

/**
 * Service for parsing various data formats from input streams.
 */
public interface DataFormatParserService {

  default public DataParser getParser(String id, byte[] data, int offset, int len) throws DataParserException {
    return getParser(id, new ByteArrayInputStream(data, offset, len), "0");
  }

  default public DataParser getParser(String id, byte[] data) throws DataParserException {
    return getParser(id, data, 0, data.length);
  }

  default public DataParser getParser(String id, String data) throws DataParserException {
    return getParser(id, new StringReader(data));
  }

  default public DataParser getParser(String id, Reader reader) throws DataParserException {
    return getParser(id, reader, 0);
  }

  default public DataParser getParser(File file, String fileOffset) throws DataParserException {
    try {
      return getParser(file.getName(), new FileInputStream(file), fileOffset);
    } catch (FileNotFoundException e) {
      throw new DataParserException(Errors.DATA_PARSER_00, file.getAbsolutePath(), e.toString(), e);
    }
  }

  public DataParser getParser(String id, InputStream is, String offset) throws DataParserException;

  public DataParser getParser(String id, Reader reader, long offset) throws DataParserException;

  public DataParser getParser(String id, Map<String, Object> metadata, FileRef fileRef) throws DataParserException;

  /**
   * Charset that is used by the service when reading text data.
   */
  public String getCharset();
}
