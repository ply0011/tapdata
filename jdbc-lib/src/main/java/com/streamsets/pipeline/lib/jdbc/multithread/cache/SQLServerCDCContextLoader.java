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
package com.streamsets.pipeline.lib.jdbc.multithread.cache;

import com.google.common.cache.CacheLoader;
import com.streamsets.pipeline.lib.jdbc.multithread.ConnectionManager;
import com.streamsets.pipeline.lib.jdbc.multithread.TableContext;
import com.streamsets.pipeline.lib.jdbc.multithread.TableReadContext;
import com.streamsets.pipeline.lib.jdbc.multithread.TableRuntimeContext;
import com.streamsets.pipeline.lib.jdbc.multithread.util.MSQueryUtil;
import com.streamsets.pipeline.lib.jdbc.multithread.util.OffsetQueryUtil;

import java.util.ArrayList;
import java.util.Map;

public class SQLServerCDCContextLoader extends CacheLoader<TableRuntimeContext, TableReadContext> {
  private final ConnectionManager connectionManager;
  private final Map<String, String> offsets;
  private final int fetchSize;
  private final boolean allowLateTable;
  private final boolean enableSchemaChanges;

  public SQLServerCDCContextLoader(
      ConnectionManager connectionManager,
      Map<String, String> offsets,
      int fetchSize,
      boolean allowLateTable,
      boolean enableSchemaChanges
  ) {
    this.connectionManager = connectionManager;
    this.offsets = offsets;
    this.fetchSize = fetchSize;
    this.allowLateTable = allowLateTable;
    this.enableSchemaChanges = enableSchemaChanges;
  }

  @Override
  public TableReadContext load(TableRuntimeContext tableRuntimeContext) throws Exception {
    TableContext tableContext = tableRuntimeContext.getSourceTableContext();

    final Map<String, String> offset = OffsetQueryUtil.getColumnsToOffsetMapFromOffsetFormat(offsets.get(tableRuntimeContext.getOffsetKey()));

    String query = MSQueryUtil.buildCDCQuery(
        offset,
        tableContext.getQualifiedName(),
        tableContext.getOffsetColumnToStartOffset(),
        allowLateTable,
        enableSchemaChanges
    );


    TableReadContext tableReadContext =
        new TableReadContext(
            connectionManager.getConnection(),
            query,
            new ArrayList<>(),
            fetchSize
        );

    // update last offset
    tableContext.clearStartOffset();

    return tableReadContext;
  }
}
