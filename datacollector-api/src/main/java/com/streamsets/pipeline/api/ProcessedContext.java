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
package com.streamsets.pipeline.api;

import java.util.Collection;

/**
 * Describes methods for various context classes that deals with error handling.
 */
public interface ProcessedContext {

  /**
   * Signals that the record has been fully processed for output metrics calculation.
   * Calling this method is currently optional.
   *
   * @param record Record which has completed processing.
   */
  void complete(Record record);

  /**
   * Signals that this list of records has been fully processed for output metrics calculation.
   * Calling this method is currently optional.
   *
   * @param records Records which have completed processing.
   */
  void complete(Collection<Record> records);
}
