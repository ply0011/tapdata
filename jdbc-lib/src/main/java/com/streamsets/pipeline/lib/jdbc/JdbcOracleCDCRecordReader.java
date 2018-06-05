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

import com.google.common.annotations.VisibleForTesting;
import com.streamsets.pipeline.api.Record;
import com.streamsets.pipeline.api.StageException;
import com.streamsets.pipeline.api.base.OnRecordErrorException;
import com.streamsets.pipeline.lib.operation.OperationType;
import com.streamsets.pipeline.lib.operation.UnsupportedOperationAction;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class JdbcOracleCDCRecordReader extends JdbcRecordReader {

  private static final Logger LOG = LoggerFactory.getLogger(JdbcRecordReader.class);


  /**
   * Get an operation code from record.
   * First, look for sdc.operation.code from record header.
   * If not set, look for "__$operation" in record. It is a specific field that MS SQL CDC origin set.
   *
   * If either of them is set, check if the value is supported operation.
   * If not supported, let it handle by UnsupportedAction
   * check if the value is supported.
   * @param record
   * @return
   * @throws StageException
   */
  @Override
  @VisibleForTesting
  int getOperationFromRecord(
      Record record,
      JDBCOperationType defaultOp,
      UnsupportedOperationAction unsupportedAction,
      List<OnRecordErrorException> errorRecords ) {

    int opCode = -1; // -1 is invalid and not used in OperationType.
    String op = null;
    try {
      // Try sdc.operation.type first
      op = record.getHeader().getAttribute(OperationType.SDC_OPERATION_TYPE);
      // If not set, look for oracle.cdc.operation in record header.
      if (StringUtils.isBlank(op)) {
          op = record.getHeader().getAttribute(OracleCDCOperationCode.OPERATION);
          if (op != null) {
            // Convert the Oracle specific operation code to SDC standard operation code
            opCode = OracleCDCOperationCode.convertFromOracleToSDCCode(op);
          }
      } else {
        opCode = JDBCOperationType.convertToIntCode(op);
      }
      if (opCode == -1){
        opCode = defaultOp.getCode();
      }
    } catch (NumberFormatException | UnsupportedOperationException ex) {
      LOG.debug(
          "Operation obtained from record is not supported: {}. Handle by UnsupportedOpertaionAction {}. {}",
          ex.getMessage(),
          unsupportedAction.getLabel(),
          ex
      );
      switch (unsupportedAction) {
        case DISCARD:
          LOG.debug("Discarding record with unsupported operation {}", op);
          break;
        case SEND_TO_ERROR:
          LOG.debug("Sending record to error due to unsupported operation {}", op);
          errorRecords.add(new OnRecordErrorException(record, JdbcErrors.JDBC_70, op));
          break;
        case USE_DEFAULT:
          opCode = defaultOp.code;
          break;
        default: //unknown action
          LOG.debug("Sending record to error due to unknown operation: {}", op);
      }
    }
    return opCode;
  }
}
