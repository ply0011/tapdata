/*
 * Copyright 2018 StreamSets Inc.
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
package com.streamsets.pipeline.stage.origin.hdfs;

import com.streamsets.pipeline.api.PushSource;
import com.streamsets.pipeline.api.StageException;
import com.streamsets.pipeline.lib.dirspooler.Offset;
import com.streamsets.pipeline.lib.dirspooler.SpoolDirBaseSource;
import com.streamsets.pipeline.lib.dirspooler.SpoolDirConfigBean;
import com.streamsets.pipeline.lib.dirspooler.SpoolDirUtil;
import com.streamsets.pipeline.lib.dirspooler.WrappedFileSystem;
import com.streamsets.pipeline.stage.origin.hdfs.spooler.HdfsFileSystem;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class HdfsSource extends SpoolDirBaseSource {
  public static final String OFFSET_VERSION =
      "$com.streamsets.pipeline.stage.origin.hdfs.HdfsSource.offset.version$";

  private final HdfsSourceConfigBean hdfsSourceConfigBean;

  public HdfsSource(SpoolDirConfigBean conf, HdfsSourceConfigBean hdfsSourceConfigBean) {
    this.conf = conf;
    this.hdfsSourceConfigBean = hdfsSourceConfigBean;

    GROUP_FILE_CONFIG_NAME = Groups.FILES.name();
    GROUPS_POST_PROCESSING_CONFIG_NAME = Groups.POST_PROCESSING.name();
  }

  @Override
  protected List<ConfigIssue> init() {
    List<ConfigIssue> issuesTemp = new ArrayList<>();
    hdfsSourceConfigBean.init(getContext(), issuesTemp);

    if (issuesTemp.isEmpty()) {
      List<ConfigIssue> issues = super.init();
      issuesTemp.addAll(issues);
    }

    return issuesTemp;
  }

  public Map<String, Offset> handleLastSourceOffset(Map<String, String> lastSourceOffset, PushSource.Context context) throws
      StageException {
    Map<String, Offset> offsetMap = new HashMap<>();

    if (lastSourceOffset != null && lastSourceOffset.size() > 0) {
      String version = lastSourceOffset.get(OFFSET_VERSION);
      Set<String> key = lastSourceOffset.keySet();
      Iterator iterator = key.iterator();

      while (iterator.hasNext()) {
        String keyString = (String) iterator.next();
        if (keyString.equals(OFFSET_VERSION)) {
          continue;
        }

        Offset offset = new Offset(version, keyString, lastSourceOffset.get(keyString));
        offsetMap.put(offset.getFile(), offset);

        WrappedFileSystem fs = getFs();

        if (lastSourceFileName != null) {
          if (useLastModified) {
            // return the newest file in the offset
            if (SpoolDirUtil.compareFiles(
                fs,
                fs.getFile(spooler.getSpoolDir(), lastSourceFileName),
                fs.getFile(spooler.getSpoolDir(), offset.getFile())
            )) {
              lastSourceFileName = offset.getFile();
            }
          } else {
            if (offset.getFile().compareTo(lastSourceFileName) < 0) {
              lastSourceFileName = offset.getFile();
            }
          }
        } else {
          lastSourceFileName = offset.getFile();
        }
      }
    }

    if (offsetMap.isEmpty()) {
      // commit the offset version
      context.commitOffset(OFFSET_VERSION, OFFSET_VERSION_ONE);

      Offset offset = new Offset(Offset.VERSION_ONE, null);
      offsetMap.put(offset.getFile(), offset);
      lastSourceFileName = offset.getFile();
    }

    return offsetMap;
  }

  public WrappedFileSystem getFs() {
    return new HdfsFileSystem(conf.filePattern, conf.pathMatcherMode, conf.processSubdirectories, hdfsSourceConfigBean.getFileSystem());
  }
}
