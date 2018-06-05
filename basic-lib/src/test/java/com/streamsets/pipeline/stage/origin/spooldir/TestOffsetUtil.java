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
package com.streamsets.pipeline.stage.origin.spooldir;

import com.streamsets.pipeline.lib.util.OffsetUtil;
import com.streamsets.pipeline.lib.dirspooler.Offset;
import org.junit.Assert;

import java.util.Map;

public final class TestOffsetUtil {
  private TestOffsetUtil() {}
  private static final String VERSION_ONE = "1";
  private static final String OFFSET_VERSION =
      "$com.streamsets.pipeline.stage.origin.spooldir.SpoolDirSource.offset.version$";
  private static final String POS = "POS";

  public static void compare(String offsetV1, Map<String, String> offsetV2) {

    try {
      Offset offset = new Offset(VERSION_ONE, offsetV1);
      offsetV2.remove(OFFSET_VERSION);

      Assert.assertTrue(String.format("offset does not contain file: %s", offset.getFile()), offsetV2.containsKey(offset.getFile()));
      Assert.assertEquals(offset.getOffset(), OffsetUtil.deserializeOffsetMap(offsetV2.get(offset.getFile())).get(POS));
      Assert.assertEquals(offset.getOffsetString(), offsetV2.get(offset.getFile()));
    } catch (Exception ex) {
      Assert.fail(ex.toString());
    }

  }


}
