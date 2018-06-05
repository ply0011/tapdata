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
package com.streamsets.pipeline.lib.jdbc;


import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSortedMap;
import com.streamsets.pipeline.api.Field;
import com.streamsets.pipeline.api.Record;
import com.streamsets.pipeline.api.StageException;
import com.streamsets.pipeline.api.base.OnRecordErrorException;
import com.streamsets.pipeline.lib.operation.OperationType;
import com.streamsets.pipeline.lib.operation.UnsupportedOperationAction;
import com.streamsets.pipeline.sdk.RecordCreator;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.SortedMap;
import java.util.TreeMap;

import static org.junit.Assert.assertEquals;

public class TestJdbcMultiRowRecordWriter {
  private static final Logger LOG = LoggerFactory.getLogger(TestJdbcMultiRowRecordWriter.class);

  private final String username = "sa";
  private final String password = "sa";
  private final Date expectedDatetime = new Date();
  private static final String connectionString = "jdbc:h2:mem:test";
  private DataSource dataSource;
  private Connection connection;

  private long id;
  private static final Random random = new Random();

  @Before
  public void setUp() throws Exception {
    id = 0L;
    // Create a table in H2 and put some data in it for querying.
    HikariConfig config = new HikariConfig();
    config.setJdbcUrl(connectionString);
    config.setUsername(username);
    config.setPassword(password);
    config.setMaximumPoolSize(3);
    dataSource = new HikariDataSource(config);

    connection = dataSource.getConnection();
    try (Statement statement = connection.createStatement()) {
      // Setup table
      statement.addBatch("CREATE SCHEMA IF NOT EXISTS TEST;");
      statement.addBatch(
          "CREATE TABLE IF NOT EXISTS TEST.TEST_TABLE " +
              "(P_ID INT NOT NULL, F1 INT, F2 INT, F3 INT, F4 DATETIME, UNIQUE(P_ID), PRIMARY KEY(P_ID));"
      );
      String unprivUser = "unpriv_user";
      String unprivPassword = "unpriv_pass";
      statement.addBatch("CREATE USER IF NOT EXISTS " + unprivUser + " PASSWORD '" + unprivPassword + "';");
      statement.addBatch("GRANT SELECT ON TEST.TEST_TABLE TO " + unprivUser + ";");

      statement.executeBatch();
    }
  }

  @After
  public void tearDown() throws Exception {
    try (Statement statement = connection.createStatement()) {
      // Setup table
      statement.execute("DROP TABLE IF EXISTS TEST.TEST_TABLE;");
    }

    // Last open connection terminates H2
    connection.close();
  }

  @Test
  public void testThreePartitions() throws Exception {
    List<JdbcFieldColumnParamMapping> mappings = new ArrayList<>();

    JdbcRecordWriter writer = new JdbcMultiRowRecordWriter(
        connectionString,
        dataSource,
        "TEST",
        "TEST_TABLE",
        false,
        mappings,
        JdbcMultiRowRecordWriter.UNLIMITED_PARAMETERS,
        JDBCOperationType.INSERT,
        UnsupportedOperationAction.DISCARD,
        new JdbcRecordReader(),
        false
    );
    List<Record> batch = generateRecords(10);
    writer.writeBatch(batch);

    connection = DriverManager.getConnection(connectionString, username, password);
    try (Statement statement = connection.createStatement()) {
      ResultSet rs = statement.executeQuery("SELECT COUNT(*) FROM TEST.TEST_TABLE");
      rs.next();
      assertEquals(10, rs.getInt(1));
    }
  }

  @Test
  public void testUnsupportedOperationErrorRecordCount() throws Exception {
    List<JdbcFieldColumnParamMapping> mappings = new ArrayList<>();

    JdbcRecordWriter writer = new JdbcMultiRowRecordWriter(
        connectionString,
        dataSource,
        "TEST",
        "TEST_TABLE",
        false,
        mappings,
        JdbcMultiRowRecordWriter.UNLIMITED_PARAMETERS,
        JDBCOperationType.INSERT,
        UnsupportedOperationAction.SEND_TO_ERROR,
        new JdbcRecordReader(),
        false
    );
    List<Record> batch = generateRecords(10);
    batch.get(0).getHeader().setAttribute(OperationType.SDC_OPERATION_TYPE, "-5");
    List<OnRecordErrorException> errors = writer.writeBatch(batch);

    assertEquals(1, errors.size());

    connection = DriverManager.getConnection(connectionString, username, password);
    try (Statement statement = connection.createStatement()) {
      ResultSet rs = statement.executeQuery("SELECT COUNT(*) FROM TEST.TEST_TABLE");
      rs.next();
      assertEquals(9, rs.getInt(1));
    }
  }

  @Test(expected = UnsupportedOperationException.class)
  public void testThreePartitionsPerRecord() throws Exception {
    List<JdbcFieldColumnParamMapping> mappings = new ArrayList<>();
    boolean caseSensitive = false;

    JdbcRecordWriter writer = new JdbcMultiRowRecordWriter(
        connectionString,
        dataSource,
        "TEST",
        "TEST_TABLE",
        false,
        mappings,
        JdbcMultiRowRecordWriter.UNLIMITED_PARAMETERS,
        JDBCOperationType.INSERT,
        UnsupportedOperationAction.DISCARD,
        new JdbcRecordReader(),
        caseSensitive
    );
    List<Record> batch = generateRecords(10);

    writer.writePerRecord(batch);
  }

  @Test
  public void testParameterLimit() throws Exception {
    List<JdbcFieldColumnParamMapping> mappings = new ArrayList<>();

    boolean caseSensitive = false;
    JdbcRecordWriter writer = new JdbcMultiRowRecordWriter(
        connectionString,
        dataSource,
        "TEST",
        "TEST_TABLE",
        false,
        mappings,
        8,
        JDBCOperationType.INSERT,
        UnsupportedOperationAction.DISCARD,
        new JdbcRecordReader(),
        caseSensitive
    );

    Collection<Record> records = generateRecords(10);
    writer.writeBatch(records);


    // note that unfortunately we have no way to directly observe that the expected batching is actually occurring -
    // only that the correct number of rows comes out even when we enable a meaningful parameter limit.
    connection = DriverManager.getConnection(connectionString, username, password);
    try (Statement statement = connection.createStatement()) {
      ResultSet rs = statement.executeQuery("SELECT COUNT(*) FROM TEST.TEST_TABLE");
      rs.next();
      assertEquals(10, rs.getInt(1));
    }
  }

  @Test
  public void testDatetimeColumn() throws Exception {
    List<JdbcFieldColumnParamMapping> mappings = new ArrayList<>();

    boolean caseSensitive = false;
    JdbcRecordWriter writer = new JdbcMultiRowRecordWriter(
        connectionString,
        dataSource,
        "TEST",
        "TEST_TABLE",
        false,
        mappings,
        JdbcMultiRowRecordWriter.UNLIMITED_PARAMETERS,
        JDBCOperationType.INSERT,
        UnsupportedOperationAction.DISCARD,
        new JdbcRecordReader(),
        caseSensitive
    );

    Collection<Record> records = generateRecords(1);
    writer.writeBatch(records);

    connection = DriverManager.getConnection(connectionString, username, password);
    try (Statement statement = connection.createStatement()) {
      ResultSet rs = statement.executeQuery("SELECT F4 FROM TEST.TEST_TABLE LIMIT 1");
      rs.next();
      // Make sure timestamp retrieved from the table is equal to the expected datetime.
      assertEquals(0, rs.getTimestamp(1).compareTo(expectedDatetime));
    }
  }

  @Test(expected = OnRecordErrorException.class)
  public void testEmptyColumnMappingError() throws Exception {
    List<JdbcFieldColumnParamMapping> mappings = new ArrayList<>();

    boolean caseSensitive = false;
    JdbcRecordWriter writer = new JdbcMultiRowRecordWriter(
        connectionString,
        dataSource,
        "TEST",
        "TEST_TABLE",
        false,
        mappings,
        JdbcMultiRowRecordWriter.UNLIMITED_PARAMETERS,
        JDBCOperationType.INSERT,
        UnsupportedOperationAction.DISCARD,
        new JdbcRecordReader(),
        caseSensitive
    );

    Collection<Record> records = new ArrayList<>();
    records.add(RecordCreator.create());
    try {
      writer.writeBatch(records);
    } catch (StageException e) {
      assertEquals(JdbcErrors.JDBC_22.getCode(), e.getErrorCode().toString());
      throw e;
    }
  }

  @Test
  public void testGenerateQueryForMultiRow() throws StageException {
    SortedMap<String, String> columns = new TreeMap<>();
    columns.put("P_ID", "?");
    columns.put("F1", "?");
    columns.put("F2", "?");
    columns.put("F3", "?");
    columns.put("F4", "?");

    List<String> primaryKeys = ImmutableList.of("P_ID");
    List<Record> records = generateRecords(3);
    boolean caseSensitive = false;
    JdbcMultiRowRecordWriter writer = new JdbcMultiRowRecordWriter(
        connectionString,
        dataSource,
        "TEST",
        "TEST_TABLE",
        false, //rollback
        new LinkedList<JdbcFieldColumnParamMapping>(),
        15,
        JDBCOperationType.INSERT,
        UnsupportedOperationAction.DISCARD,
        new JdbcRecordReader(),
        caseSensitive
    );
    // Test Insert query

    Assert.assertEquals(
        "Generated a wrong query",
        "INSERT INTO TEST.TEST_TABLE (F1, F2, F3, F4, P_ID) " + "VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, " +
            "?, ?)",
        writer.generateQueryForMultiRow(OperationType.INSERT_CODE, columns, primaryKeys, records.size())
    );


    // Test Delete query

    Assert.assertEquals(
        "Generated a wrong query",
        "DELETE FROM TEST.TEST_TABLE WHERE (P_ID) IN ((?), (?), (?))",
        writer.generateQueryForMultiRow(OperationType.DELETE_CODE, columns, primaryKeys, records.size())
    );

    // Test Update query
    columns.remove("P_ID");
    Assert.assertEquals(
        "Generated a wrong query",
        "UPDATE TEST.TEST_TABLE SET F1 = ?, F2 = ?, F3 = ?, F4 = ? WHERE P_ID = ?",
        writer.generateQueryForMultiRow(OperationType.UPDATE_CODE, columns, primaryKeys, records.size())
    );
  }

  @Test
  public void testGenerateQueryForMultiRowWithQuote() throws StageException {
    SortedMap<String, String> columns = ImmutableSortedMap.of(
        "P_ID", "?",
        "F1", "?",
        "F2", "?",
        "F3", "?",
        "F4", "?"
    );
    List<String> primaryKeys = ImmutableList.of("P_ID");
    List<Record> records = generateRecords(3);
    JdbcMultiRowRecordWriter writer = new JdbcMultiRowRecordWriter(
        connectionString,
        dataSource,
        "TEST",
        "TEST_TABLE",
        false, //rollback
        new LinkedList<>(),
        15,
        JDBCOperationType.INSERT,
        UnsupportedOperationAction.DISCARD,
        new JdbcRecordReader(),
        true
    );

    // Test Insert query
    Assert.assertEquals(
        "Generated a wrong query",
        "INSERT INTO \"TEST\".\"TEST_TABLE\" (\"F1\", \"F2\", \"F3\", \"F4\", \"P_ID\") " + "VALUES (?, ?, ?, ?, ?), " +
            "(?, ?, ?, ?, ?), (?, ?, ?, ?, ?)",
        writer.generateQueryForMultiRow(OperationType.INSERT_CODE, columns, primaryKeys, records.size())
    );

    // Test Update query
    Assert.assertEquals(
        "Generated a wrong query",
        "UPDATE \"TEST\".\"TEST_TABLE\" SET \"F1\" = ?, \"F2\" = ?, \"F3\" = ?, \"F4\" = ?, \"P_ID\" = ? WHERE " +
            "\"P_ID\" = ?",
        writer.generateQueryForMultiRow(OperationType.UPDATE_CODE, columns, primaryKeys, records.size())
    );

    // Test Delete query
    Assert.assertEquals(
        "Generated a wrong query",
        "DELETE FROM \"TEST\".\"TEST_TABLE\" WHERE (\"P_ID\") IN ((?), (?), (?))",
        writer.generateQueryForMultiRow(OperationType.DELETE_CODE, columns, primaryKeys, records.size())
    );
  }

  @Test
  public void testUpdatePrimaryKey() throws Exception {
    /* Test to generate and run UPDATE query.
     * Send a sample insert record and then update record,
     * then check if the column is indeed updated.
     */
    Record insertRecord = RecordCreator.create();
    Map<String, Field> insert = new HashMap<>();
    insert.put("P_ID", Field.create(200));
    insert.put("F1", Field.create(1000));
    insertRecord.getHeader().setAttribute(
        OperationType.SDC_OPERATION_TYPE,
        String.valueOf(OperationType.INSERT_CODE)
    );
    insertRecord.set(Field.create(insert));

    Record updateRecord = RecordCreator.create();
    Map<String, Field> update = new HashMap<>();
    update.put("P_ID", Field.create(200));
    update.put("F1", Field.create(2000));
    updateRecord.getHeader().setAttribute(
        OperationType.SDC_OPERATION_TYPE,
        String.valueOf(OperationType.UPDATE_CODE)
    );
    updateRecord.set(Field.create(update));

    boolean caseSensitive = false;

    JdbcMultiRowRecordWriter writer = new JdbcMultiRowRecordWriter(
        connectionString,
        dataSource,
        "TEST",
        "TEST_TABLE",
        false, //rollback
        new LinkedList<JdbcFieldColumnParamMapping>(),
        PreparedStatementCache.UNLIMITED_CACHE,
        JDBCOperationType.INSERT,
        UnsupportedOperationAction.USE_DEFAULT,
        new JdbcRecordReader(),
        caseSensitive
    );
    List<Record> batch = ImmutableList.of(insertRecord, updateRecord);
    writer.writeBatch(batch);

    connection = DriverManager.getConnection(connectionString, username, password);
    try (Statement statement = connection.createStatement()) {
      ResultSet rs = statement.executeQuery("SELECT P_ID, F1 FROM TEST.TEST_TABLE WHERE P_ID = 200");
      rs.next();
      assertEquals(200, rs.getInt(1));
      assertEquals(2000, rs.getInt(2));
    }
  }

  private List<Record> generateRecords(int numRecords) {
    List<Record> records = new ArrayList<>(numRecords);
    for (int i = 0; i < numRecords; i++) {
      records.add(generateRecord());
    }
    return records;
  }

  private Record generateRecord() {
    Record record = RecordCreator.create();
    Map<String, Field> fields = new HashMap<>();
    fields.put("P_ID", Field.create(++id));
    fields.put("F1", Field.create(random.nextInt()));
    if (id % 2 == 0) {
      fields.put("F2", Field.create(random.nextInt()));
    }
    if (id % 4 == 0) {
      fields.put("F3", Field.create(random.nextInt()));
    }
    fields.put("F4", Field.createDatetime(expectedDatetime));
    record.set(Field.create(fields));

    LOG.debug(record.toString());
    return record;
  }
}
