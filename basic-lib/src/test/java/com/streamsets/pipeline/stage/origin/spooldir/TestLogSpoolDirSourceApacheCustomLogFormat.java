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

import com.streamsets.pipeline.api.BatchMaker;
import com.streamsets.pipeline.api.Record;
import com.streamsets.pipeline.api.StageException;
import com.streamsets.pipeline.config.Compression;
import com.streamsets.pipeline.config.DataFormat;
import com.streamsets.pipeline.config.LogMode;
import com.streamsets.pipeline.config.OnParseError;
import com.streamsets.pipeline.config.PostProcessingOptions;
import com.streamsets.pipeline.lib.dirspooler.LocalFileSystem;
import com.streamsets.pipeline.lib.dirspooler.Offset;
import com.streamsets.pipeline.lib.dirspooler.PathMatcherMode;
import com.streamsets.pipeline.lib.dirspooler.SpoolDirConfigBean;
import com.streamsets.pipeline.lib.dirspooler.SpoolDirRunnable;
import com.streamsets.pipeline.sdk.PushSourceRunner;
import com.streamsets.pipeline.sdk.SourceRunner;
import com.streamsets.pipeline.sdk.StageRunner;
import com.streamsets.pipeline.lib.dirspooler.WrappedFile;
import org.apache.commons.io.IOUtils;
import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.io.FileWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class TestLogSpoolDirSourceApacheCustomLogFormat {

  private static final String CUSTOM_LOG_FORMAT = "%h %l %u [%t] \"%m %U %H\" %>s %b";
  private static final String INVALID_CUSTOM_LOG_FORMAT = "%h %xyz %u %t \"%m %U %H\" %>s %b";

  private static final int threadNumber = 0;
  private static final int batchSize = 10;
  private static final Map<String, Offset> lastSourceOffset = new HashMap<>();

  private String createTestDir() {
    File f = new File("target", UUID.randomUUID().toString());
    Assert.assertTrue(f.mkdirs());
    return f.getAbsolutePath();
  }

  private final static String LINE1 = "127.0.0.1 ss h [10/Oct/2000:13:55:36 -0700] \"GET /apache_pb.gif HTTP/1.0\" 200 2326";
  private final static String LINE2 = "127.0.0.2 ss m [10/Oct/2000:13:55:36 -0800] \"GET /apache_pb.gif HTTP/2.0\" 200 2326";

  private WrappedFile createLogFile() throws Exception {
    File f = new File(createTestDir(), "test.log");
    Writer writer = new FileWriter(f);
    IOUtils.write(LINE1 + "\n", writer);
    IOUtils.write(LINE2, writer);
    writer.close();
    return new LocalFileSystem("*", PathMatcherMode.GLOB).getFile(f.getAbsolutePath());
  }

  private SpoolDirSource createSource() {
    SpoolDirConfigBean conf = new SpoolDirConfigBean();
    conf.dataFormat = DataFormat.LOG;
    conf.dataFormatConfig.charset = "UTF-8";
    conf.dataFormatConfig.removeCtrlChars = false;
    conf.overrunLimit = 100;
    conf.spoolDir = createTestDir();
    conf.batchSize = 10;
    conf.poolingTimeoutSecs = 1;
    conf.filePattern = "file-[0-9].log";
    conf.pathMatcherMode = PathMatcherMode.GLOB;
    conf.maxSpoolFiles = 10;
    conf.initialFileToProcess = null;
    conf.dataFormatConfig.compression = Compression.NONE;
    conf.dataFormatConfig.filePatternInArchive = "*";
    conf.errorArchiveDir = null;
    conf.postProcessing = PostProcessingOptions.ARCHIVE;
    conf.archiveDir = createTestDir();
    conf.retentionTimeMins = 10;
    conf.dataFormatConfig.logMode = LogMode.APACHE_CUSTOM_LOG_FORMAT;
    conf.dataFormatConfig.logMaxObjectLen = 1000;
    conf.dataFormatConfig.retainOriginalLine = true;
    conf.dataFormatConfig.customLogFormat = CUSTOM_LOG_FORMAT;
    conf.dataFormatConfig.onParseError = OnParseError.ERROR;
    conf.dataFormatConfig.maxStackTraceLines = 0;

    return new SpoolDirSource(conf);
  }

  @Test
  public void testProduceFullFile() throws Exception {
    SpoolDirSource source = createSource();
    PushSourceRunner runner = new PushSourceRunner.Builder(SpoolDirDSource.class, source).addOutputLane("lane").build();
    runner.runInit();
    try {
      BatchMaker batchMaker = SourceRunner.createTestBatchMaker("lane");
      SpoolDirRunnable runnable = source.getSpoolDirRunnable(threadNumber, batchSize, lastSourceOffset);
      Assert.assertEquals("-1", runnable.generateBatch(createLogFile(), "0", 10, batchMaker));
      StageRunner.Output output = SourceRunner.getOutput(batchMaker);
      List<Record> records = output.getRecords().get("lane");
      Assert.assertNotNull(records);
      Assert.assertEquals(2, records.size());

      Assert.assertFalse(records.get(0).has("/truncated"));

      Record record = records.get(0);

      Assert.assertEquals(LINE1, record.get().getValueAsMap().get("originalLine").getValueAsString());

      Assert.assertFalse(record.has("/truncated"));

      Assert.assertTrue(record.has("/remoteHost"));
      Assert.assertEquals("127.0.0.1", record.get("/remoteHost").getValueAsString());

      Assert.assertTrue(record.has("/logName"));
      Assert.assertEquals("ss", record.get("/logName").getValueAsString());

      Assert.assertTrue(record.has("/remoteUser"));
      Assert.assertEquals("h", record.get("/remoteUser").getValueAsString());

      Assert.assertTrue(record.has("/requestTime"));
      Assert.assertEquals("10/Oct/2000:13:55:36 -0700", record.get("/requestTime").getValueAsString());

      Assert.assertTrue(record.has("/requestMethod"));
      Assert.assertEquals("GET", record.get("/requestMethod").getValueAsString());

      Assert.assertTrue(record.has("/urlPath"));
      Assert.assertEquals("/apache_pb.gif", record.get("/urlPath").getValueAsString());

      Assert.assertTrue(record.has("/httpversion"));
      Assert.assertEquals("1.0", record.get("/httpversion").getValueAsString());

      Assert.assertTrue(record.has("/status"));
      Assert.assertEquals("200", record.get("/status").getValueAsString());

      Assert.assertTrue(record.has("/bytesSent"));
      Assert.assertEquals("2326", record.get("/bytesSent").getValueAsString());

      record = records.get(1);

      Assert.assertEquals(LINE2, records.get(1).get().getValueAsMap().get("originalLine").getValueAsString());
      Assert.assertFalse(record.has("/truncated"));

      Assert.assertTrue(record.has("/remoteHost"));
      Assert.assertEquals("127.0.0.2", record.get("/remoteHost").getValueAsString());

      Assert.assertTrue(record.has("/logName"));
      Assert.assertEquals("ss", record.get("/logName").getValueAsString());

      Assert.assertTrue(record.has("/remoteUser"));
      Assert.assertEquals("m", record.get("/remoteUser").getValueAsString());

      Assert.assertTrue(record.has("/requestTime"));
      Assert.assertEquals("10/Oct/2000:13:55:36 -0800", record.get("/requestTime").getValueAsString());

      Assert.assertTrue(record.has("/requestMethod"));
      Assert.assertEquals("GET", record.get("/requestMethod").getValueAsString());

      Assert.assertTrue(record.has("/urlPath"));
      Assert.assertEquals("/apache_pb.gif", record.get("/urlPath").getValueAsString());

      Assert.assertTrue(record.has("/httpversion"));
      Assert.assertEquals("2.0", record.get("/httpversion").getValueAsString());

      Assert.assertTrue(record.has("/status"));
      Assert.assertEquals("200", record.get("/status").getValueAsString());

      Assert.assertTrue(record.has("/bytesSent"));
      Assert.assertEquals("2326", record.get("/bytesSent").getValueAsString());

    } finally {
      runner.runDestroy();
    }
  }

  @Test
  public void testProduceLessThanFile() throws Exception {
    SpoolDirSource source = createSource();
    PushSourceRunner runner = new PushSourceRunner.Builder(SpoolDirDSource.class, source).addOutputLane("lane").build();
    runner.runInit();
    try {
      BatchMaker batchMaker = SourceRunner.createTestBatchMaker("lane");
      SpoolDirRunnable runnable = source.getSpoolDirRunnable(threadNumber, batchSize, lastSourceOffset);
      String offset = runnable.generateBatch(createLogFile(), "0", 1, batchMaker);
      //FIXME
      Assert.assertEquals("83", offset);
      StageRunner.Output output = SourceRunner.getOutput(batchMaker);
      List<Record> records = output.getRecords().get("lane");
      Assert.assertNotNull(records);
      Assert.assertEquals(1, records.size());


      Record record = records.get(0);
      Assert.assertFalse(record.has("/truncated"));

      Assert.assertTrue(record.has("/remoteHost"));
      Assert.assertEquals("127.0.0.1", record.get("/remoteHost").getValueAsString());

      Assert.assertTrue(record.has("/logName"));
      Assert.assertEquals("ss", record.get("/logName").getValueAsString());

      Assert.assertTrue(record.has("/remoteUser"));
      Assert.assertEquals("h", record.get("/remoteUser").getValueAsString());

      Assert.assertTrue(record.has("/requestTime"));
      Assert.assertEquals("10/Oct/2000:13:55:36 -0700", record.get("/requestTime").getValueAsString());

      Assert.assertTrue(record.has("/requestMethod"));
      Assert.assertEquals("GET", record.get("/requestMethod").getValueAsString());

      Assert.assertTrue(record.has("/urlPath"));
      Assert.assertEquals("/apache_pb.gif", record.get("/urlPath").getValueAsString());

      Assert.assertTrue(record.has("/httpversion"));
      Assert.assertEquals("1.0", record.get("/httpversion").getValueAsString());

      Assert.assertTrue(record.has("/status"));
      Assert.assertEquals("200", record.get("/status").getValueAsString());

      Assert.assertTrue(record.has("/bytesSent"));
      Assert.assertEquals("2326", record.get("/bytesSent").getValueAsString());

      batchMaker = SourceRunner.createTestBatchMaker("lane");
      offset = runnable.generateBatch(createLogFile(), offset, 1, batchMaker);
      Assert.assertEquals("165", offset);
      output = SourceRunner.getOutput(batchMaker);
      records = output.getRecords().get("lane");
      Assert.assertNotNull(records);
      Assert.assertEquals(1, records.size());

      Assert.assertEquals(LINE2, records.get(0).get().getValueAsMap().get("originalLine").getValueAsString());
      Assert.assertFalse(records.get(0).has("/truncated"));

      record = records.get(0);
      Assert.assertTrue(record.has("/remoteHost"));
      Assert.assertEquals("127.0.0.2", record.get("/remoteHost").getValueAsString());

      Assert.assertTrue(record.has("/logName"));
      Assert.assertEquals("ss", record.get("/logName").getValueAsString());

      Assert.assertTrue(record.has("/remoteUser"));
      Assert.assertEquals("m", record.get("/remoteUser").getValueAsString());

      Assert.assertTrue(record.has("/requestTime"));
      Assert.assertEquals("10/Oct/2000:13:55:36 -0800", record.get("/requestTime").getValueAsString());

      Assert.assertTrue(record.has("/requestMethod"));
      Assert.assertEquals("GET", record.get("/requestMethod").getValueAsString());

      Assert.assertTrue(record.has("/urlPath"));
      Assert.assertEquals("/apache_pb.gif", record.get("/urlPath").getValueAsString());

      Assert.assertTrue(record.has("/httpversion"));
      Assert.assertEquals("2.0", record.get("/httpversion").getValueAsString());

      Assert.assertTrue(record.has("/status"));
      Assert.assertEquals("200", record.get("/status").getValueAsString());

      Assert.assertTrue(record.has("/bytesSent"));
      Assert.assertEquals("2326", record.get("/bytesSent").getValueAsString());


      batchMaker = SourceRunner.createTestBatchMaker("lane");
      offset = runnable.generateBatch(createLogFile(), offset, 1, batchMaker);
      Assert.assertEquals("-1", offset);
      output = SourceRunner.getOutput(batchMaker);
      records = output.getRecords().get("lane");
      Assert.assertNotNull(records);
      Assert.assertEquals(0, records.size());

    } finally {
      runner.runDestroy();
    }
  }

  @Test(expected = StageException.class)
  public void testInvalidFormat() throws StageException {
    SpoolDirConfigBean conf = new SpoolDirConfigBean();
    conf.dataFormat = DataFormat.LOG;
    conf.dataFormatConfig.charset = "UTF-8";
    conf.dataFormatConfig.removeCtrlChars = false;
    conf.overrunLimit = 100;
    conf.spoolDir = createTestDir();
    conf.batchSize = 10;
    conf.poolingTimeoutSecs = 1;
    conf.filePattern = "file-[0-9].log";
    conf.pathMatcherMode = PathMatcherMode.GLOB;
    conf.maxSpoolFiles = 10;
    conf.initialFileToProcess = null;
    conf.dataFormatConfig.compression = Compression.NONE;
    conf.dataFormatConfig.filePatternInArchive = "*";
    conf.errorArchiveDir = null;
    conf.postProcessing = PostProcessingOptions.ARCHIVE;
    conf.archiveDir = createTestDir();
    conf.retentionTimeMins = 10;
    conf.dataFormatConfig.logMode = LogMode.APACHE_CUSTOM_LOG_FORMAT;
    conf.dataFormatConfig.logMaxObjectLen = 1000;
    conf.dataFormatConfig.retainOriginalLine = true;
    conf.dataFormatConfig.customLogFormat = INVALID_CUSTOM_LOG_FORMAT;
    conf.dataFormatConfig.onParseError = OnParseError.ERROR;
    conf.dataFormatConfig.maxStackTraceLines = 0;

    SpoolDirSource spoolDirSource = new SpoolDirSource(conf);
    PushSourceRunner runner = new PushSourceRunner.Builder(SpoolDirDSource.class, spoolDirSource).addOutputLane("lane").build();
    runner.runInit();
  }
}
