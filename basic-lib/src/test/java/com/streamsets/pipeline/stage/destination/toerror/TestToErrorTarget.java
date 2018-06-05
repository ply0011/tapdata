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
package com.streamsets.pipeline.stage.destination.toerror;

import com.google.common.collect.ImmutableList;
import com.streamsets.pipeline.api.Field;
import com.streamsets.pipeline.api.Record;
import com.streamsets.pipeline.api.Target;
import com.streamsets.pipeline.sdk.RecordCreator;
import com.streamsets.pipeline.sdk.TargetRunner;
import org.junit.Assert;
import org.junit.Test;

import java.util.List;

public class TestToErrorTarget {


  @Test
  public void testOutErr() throws Exception {
    Target target = new ToErrorTarget();
    TargetRunner runner = new TargetRunner.Builder(ToErrorDTarget.class, target)
        .build();
    runner.runInit();
    try {

      Record record = RecordCreator.create();
      record.set(Field.create("Hello"));
      List<Record> input = ImmutableList.of(record);
      runner.runWrite(input);
      Assert.assertEquals(1, runner.getErrorRecords().size());
      Assert.assertEquals("Hello", runner.getErrorRecords().get(0).get().getValueAsString());
    } finally {
      runner.runDestroy();
    }
  }
}
