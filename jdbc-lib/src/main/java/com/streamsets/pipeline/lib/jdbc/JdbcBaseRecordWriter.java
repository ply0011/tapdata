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

import com.google.common.base.Strings;
import com.streamsets.pipeline.api.Field;
import com.streamsets.pipeline.api.Record;
import com.streamsets.pipeline.api.StageException;
import com.streamsets.pipeline.api.base.OnRecordErrorException;
import com.streamsets.pipeline.lib.operation.UnsupportedOperationAction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Array;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;

public abstract class JdbcBaseRecordWriter implements JdbcRecordWriter {
  private static final Logger LOG = LoggerFactory.getLogger(JdbcBaseRecordWriter.class);
  private final List<JdbcFieldColumnParamMapping> customMappings;

  private final String connectionString;
  private final DataSource dataSource;
  private final String schema;
  private final String tableName;
  private final boolean rollbackOnError;
  private final boolean caseSensitive;

  private Map<String, String> columnsToFields = new HashMap<>();
  private Map<String, String> columnsToParameters = new HashMap<>();
  private final List<JdbcFieldColumnMapping> generatedColumnMappings;
  private Map<String, Integer> columnType = new HashMap<>();
  private List<String> primaryKeyColumns;
  private Map<String, String> columnsWithoutPrimaryKeys;
  JdbcRecordReader recordReader;

  // Index of columns returned by DatabaseMetaData.getColumns. Defined in DatabaseMetaData class.
  private static final int COLUMN_NAME = 4;
  private static final int DATA_TYPE = 5;

  JDBCOperationType defaultOp;
  UnsupportedOperationAction unsupportedAction;
  private List<String> primaryKeyParams;

  public JdbcBaseRecordWriter(
      String connectionString,
      DataSource dataSource,
      String schema,
      String tableName,
      boolean rollbackOnError,
      List<JdbcFieldColumnParamMapping> customMappings,
      JDBCOperationType defaultOp,
      UnsupportedOperationAction unsupportedAction,
      JdbcRecordReader recordReader,
      boolean caseSensitive
  ) throws StageException {
    this(connectionString, dataSource, schema, tableName, rollbackOnError, customMappings, defaultOp, unsupportedAction, recordReader, null, caseSensitive);
  }

  public JdbcBaseRecordWriter(
      String connectionString,
      DataSource dataSource,
      String schema,
      String tableName,
      boolean rollbackOnError,
      List<JdbcFieldColumnParamMapping> customMappings,
      JDBCOperationType defaultOp,
      UnsupportedOperationAction unsupportedAction,
      JdbcRecordReader recordReader,
      List<JdbcFieldColumnMapping> generatedColumnMappings,
      boolean caseSensitive
  ) throws StageException {
    this.connectionString = connectionString;
    this.dataSource = dataSource;


    if (Strings.isNullOrEmpty(schema) && tableName.contains(".") && !caseSensitive) {
      // Need to split this into the schema and table parts for column metadata to be retrieved.
      LOG.warn("Schema in the tableName is no longer supported. Schema should defined in Schema configuration: {}", tableName);

      String[] parts = tableName.split("\\.");
      if (parts.length != 2) {
        throw new StageException(JdbcErrors.JDBC_16, tableName);
      }

      this.schema = parts[0];
      this.tableName = tableName;
    } else {
      this.schema = schema;
      this.tableName = tableName;
    }
    this.rollbackOnError = rollbackOnError;
    this.customMappings = customMappings;
    this.defaultOp = defaultOp;
    this.unsupportedAction = unsupportedAction;
    this.recordReader = recordReader;
    this.generatedColumnMappings = generatedColumnMappings;
    this.caseSensitive = caseSensitive;

    createDefaultFieldMappings();
    createCustomFieldMappings();
    lookupPrimaryKeys();
    primaryKeyParams = new LinkedList<>();
    columnsWithoutPrimaryKeys = new HashMap<>(columnsToFields);
    for (String key: primaryKeyColumns) {
      primaryKeyParams.add(getColumnsToParameters().get(key));
      columnsWithoutPrimaryKeys.remove(key);
    }
  }

  /**
   * Access the database, obtain a list of primary key columns, and store them in primaryKeyColumns.
   * If table has no primary keys, primaryKeyColumns stays empty.
   *
   * @throws StageException
   */
  void lookupPrimaryKeys() throws StageException {
    Connection connection = null;
    try {
      connection = dataSource.getConnection();
      primaryKeyColumns = JdbcUtil.getPrimaryKeys(connection, schema, tableName);
    } catch (SQLException e) {
      String formattedError = JdbcUtil.formatSqlException(e);
      LOG.error(formattedError, e);
      throw new StageException(JdbcErrors.JDBC_17, tableName, formattedError);
    } finally {
      if (connection != null) {
        try {
          connection.close();
        } catch (SQLException e) {
          String formattedError = JdbcUtil.formatSqlException(e);
          LOG.error(formattedError, e);
        }
      }
    }
  }

  int getColumnType(String columnName) { return columnType.get(columnName); }

  /**
   * Access database and obtain the metadata for the table.
   * Store columnName and "/columnName" to the columnsToFields map as a default column-to-field mapping.
   * Store columnName and "?" to columnsToParameters map as a default column-to-value mapping.
   * They will be updated later in createCustomFieldMappings().
   *
   * @throws StageException
   */
  private void createDefaultFieldMappings() throws StageException {
    try (Connection connection = dataSource.getConnection()) {
      try (ResultSet res = JdbcUtil.getTableMetadata(connection, schema, tableName, caseSensitive)) {
        if (!res.next()) {
          throw new StageException(JdbcErrors.JDBC_16, getTableName());
        }
      }

      try (ResultSet columns = JdbcUtil.getColumnMetadata(connection, schema, tableName)) {
        while (columns.next()) {
          String columnName = columns.getString(COLUMN_NAME);
          columnsToFields.put(columnName, "/" + columnName); // Default implicit field mappings
          columnsToParameters.put(columnName, "?");
          columnType.put(columnName, columns.getInt(DATA_TYPE));
        }
      }
    } catch (SQLException e) {
      String errorMessage = JdbcUtil.formatSqlException(e);
      LOG.error(errorMessage);
      LOG.debug(errorMessage, e);
      throw new StageException(JdbcErrors.JDBC_09, tableName);
    }
  }

  /**
   * Use "Field to Column Mapping" option obtained from configuration and update
   * columnsToFields and columnsToParameters.
   */
  private void createCustomFieldMappings() {
    for (JdbcFieldColumnParamMapping mapping : customMappings) {
      LOG.debug("Custom mapping field {} to column {}", mapping.field, mapping.columnName);
      if (columnsToFields.containsKey(mapping.columnName)) {
        LOG.debug("Mapping field {} to column {}", mapping.field, mapping.columnName);
        columnsToFields.put(mapping.columnName, mapping.field);
        columnsToParameters.put(mapping.columnName, mapping.paramValue);
      }
    }
  }

  // This is necessary for supporting array data types. For some awful reason, the JDBC
  // spec requires a string name for a data type, rather than just an enum.
  static String getSQLTypeName(Field.Type type) throws OnRecordErrorException {
    switch (type) {
      case BOOLEAN:
        return "BOOLEAN";
      case CHAR:
        return "CHAR";
      case BYTE:
        return "BINARY";
      case SHORT:
        return "SMALLINT";
      case INTEGER:
        return "INTEGER";
      case LONG:
        return "BIGINT";
      case FLOAT:
        return "FLOAT";
      case DOUBLE:
        return "DOUBLE";
      case DATE:
        return "DATE";
      case TIME:
        return "TIME";
      case DATETIME:
        return "TIMESTAMP";
      case DECIMAL:
        return "DECIMAL";
      case STRING:
        return "VARCHAR";
      case BYTE_ARRAY:
        return "VARBINARY";
      case LIST_MAP:
      case MAP:
        throw new OnRecordErrorException(JdbcErrors.JDBC_05, "Unsupported list or map type: MAP");
      case LIST:
        return "ARRAY";
      default:
        throw new OnRecordErrorException(JdbcErrors.JDBC_05, "Unsupported type: " + type.name());
    }
  }

  /**
   * Database connection string
   * @return connection string
   */
  protected String getConnectionString() {
    return connectionString;
  }

  /**
   * Table this writer will write to.
   * @return table name
   */
  protected String getTableName() {
    if (!Strings.isNullOrEmpty(schema)) {
      if (caseSensitive) {
        return "\"" + schema + "\"." + "\"" + tableName + "\"";
      } else {
        return schema + "." + tableName;
      }
    }

    if (caseSensitive) {
      return "\"" + tableName + "\"";
    }

    return tableName;
  }

  /**
   * JDBC DataSource used for writing.
   * @return JDBC DataSource
   */
  DataSource getDataSource() {
    return dataSource;
  }

  /**
   * SQL Table to SDC Field mappings
   * @return map of the mappings
   */
  Map<String, String> getColumnsToFields() {
    return columnsToFields;
  }

  /**
   * SQL Columns to custom parameter mappings. These will be used to parameterized
   * an INSERT statement
   * @return map of the mappings
   */
  Map<String, String> getColumnsToParameters() {
    return columnsToParameters;
  }

  /**
   * A list of primary key column names
   * @return List of primary key column names
   */
  List<String> getPrimaryKeyColumns() {
    return primaryKeyColumns;
  }

  /**
   * A list of primary key column name
   * @return List of primary key column names
   */
  List<String> getPrimaryKeyParams() {
    return primaryKeyParams;
  }

  /**
   * A list of table columns that don't include primary key columns
   * @return List of table columns without primary keys
   */
  Map<String, String> getColumnsToFieldNoPK() {
    return columnsWithoutPrimaryKeys;
  }

  /**
   * Whether or not to try to perform a transaction rollback on error.
   * @return whether to rollback the transaction
   */
  boolean getRollbackOnError() {
    return rollbackOnError;
  }

  static List<Object> unpackList(List<Field> value) {
    List<Object> unpackedList = new ArrayList<>();
    for (Field item : value) {
      unpackedList.add(item.getValue());
    }
    return unpackedList;
  }

  List<JdbcFieldColumnMapping> getGeneratedColumnMappings() {
    return generatedColumnMappings;
  }

  void writeGeneratedColumns(
      PreparedStatement statement,
      Iterator<Record> iter,
      List<OnRecordErrorException> errorRecords
  ) throws SQLException {
    ResultSet resultSet = statement.getGeneratedKeys();

    ResultSetMetaData md = resultSet.getMetaData();
    int numColumns = md.getColumnCount();

    while (resultSet.next()) {
      Record record = iter.next();
      // Process row
      for (int i = 1; i <= numColumns; i++) {
        try {
          // Assuming generated columns can't be CLOBs/BLOBs, so just pass
          // zero for maxClobSize
          Field field = JdbcUtil.resultToField(
            md,
            resultSet,
            i,
            0,
            0,
            UnknownTypeAction.STOP_PIPELINE
          );

          if (field == null) {
            LOG.error(JdbcErrors.JDBC_03.getMessage(), md.getColumnName(i), resultSet.getObject(i));
            errorRecords.add(new OnRecordErrorException(record, JdbcErrors.JDBC_03,
                md.getColumnName(i), resultSet.getObject(i)));
          }

          record.set(generatedColumnMappings.get(i - 1).field, field);
        } catch (IOException|StageException e) {
          LOG.error(JdbcErrors.JDBC_03.getMessage(), md.getColumnName(i), resultSet.getObject(i), e);
          errorRecords.add(new OnRecordErrorException(record, JdbcErrors.JDBC_03,
              md.getColumnName(i), resultSet.getObject(i)));
        }
      }
    }
  }

  int setParamsToStatement(int paramIdx,
                PreparedStatement statement,
                SortedMap<String, String> columnsToParameters,
                Record record,
                Connection connection,
                int opCode) throws OnRecordErrorException {
    // fill in parameters to existing statement
    for (String column : columnsToParameters.keySet()) {
      Field field = record.get(recordReader.getFieldPath(column, getColumnsToFields(), opCode));
      Field.Type fieldType = field.getType();
      Object value = field.getValue();

      try {
        switch (fieldType) {
          case LIST:
            List<Field> fieldList = field.getValueAsList();
            if (fieldList.size() > 0) {
              Field.Type elementFieldType = fieldList.get(0).getType();
              Array array = connection.createArrayOf(getSQLTypeName(elementFieldType), unpackList(fieldList).toArray());
              statement.setArray(paramIdx, array);
            } else {
              statement.setArray(paramIdx, null);
            }
            break;
          case DATE:
          case TIME:
          case DATETIME:
            // Java Date types are not accepted by JDBC drivers, so we need to convert to java.sql.Timestamp
            statement.setTimestamp(paramIdx,
                field.getValueAsDate() == null ? null : new java.sql.Timestamp(field.getValueAsDatetime().getTime())
            );
            break;
          default:
            statement.setObject(paramIdx, value, getColumnType(column));
            break;
        }
      } catch (SQLException|IllegalArgumentException e) {
        LOG.error("Query failed due to {}", e.getMessage(), e);
        throw new OnRecordErrorException(record, JdbcErrors.JDBC_23, field.getValue(), fieldType.toString(), column);
      }
      ++paramIdx;
    }
    return paramIdx;
  }

  /**
   * Set primary key values to query. This is called only for UPDATE and DELETE operations.
   * If primary key value is missing in record, it throws OnRecordErrorException.
   * @param index
   * @param record
   * @param statement
   * @param opCode
   * @return
   * @throws OnRecordErrorException
   */
  int setPrimaryKeys(int index, final Record record, PreparedStatement statement, int opCode)
      throws OnRecordErrorException {
    for (String key : getPrimaryKeyColumns()) {
      Field field = record.get(recordReader.getFieldPath(key, getColumnsToFields(), opCode));
      if(field == null){
        LOG.error("Primary key {} is missing in record", key);
        throw new OnRecordErrorException(record, JdbcErrors.JDBC_19, key);
      }
      Object value = field.getValue();

      try {
        statement.setObject(index, value, getColumnType(key));
      } catch (SQLException ex){
        LOG.error("SQLException thrown: {}", ex.getMessage());
        throw new OnRecordErrorException(record, JdbcErrors.JDBC_19, key, ex);
      }
      ++index;
    }
    return index;
  }

  /**
   * This is an error that is not due to bad input record and should throw a StageException
   * once we format the error.
   *
   * @param e SQLException
   * @throws StageException
   */
  void handleSqlException(SQLException e) throws StageException {
    String formattedError = JdbcUtil.formatSqlException(e);
    LOG.error(formattedError, e);
    throw new StageException(JdbcErrors.JDBC_14, formattedError);
  }
}
