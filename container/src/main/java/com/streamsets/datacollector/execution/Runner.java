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
package com.streamsets.datacollector.execution;

import com.streamsets.datacollector.callback.CallbackInfo;
import com.streamsets.datacollector.callback.CallbackObjectType;
import com.streamsets.datacollector.execution.alerts.AlertInfo;
import com.streamsets.datacollector.execution.runner.common.PipelineRunnerException;
import com.streamsets.datacollector.execution.runner.common.SampledRecord;
import com.streamsets.datacollector.runner.production.SourceOffset;
import com.streamsets.datacollector.store.PipelineStoreException;
import com.streamsets.datacollector.util.PipelineException;
import com.streamsets.pipeline.api.Record;
import com.streamsets.pipeline.api.StageException;
import com.streamsets.pipeline.api.impl.ErrorMessage;

import java.util.Collection;
import java.util.List;
import java.util.Map;

// 3 Runner implementations:
//  STANDALONE  : current standalone
//  CLUSTER: cluster streaming
//  SLAVE: cluster streaming
//  BATCH  : cluster batch
public interface Runner {

  //Runners are lightweight control classes, they are created on every Manager.getRunner() call

  //ALl impls receive a PipelineStore instance at <init> time, to load the PipelineConfiguration if necessary
  //All impls receive a StateStore instance at <init> time.
  //All impls receive a SnapshotStore instance at <init> time.
  //All impls receive a ErrorStore instance at <init> time.
  //All impls must register all PipelineListeners (the above instance may or may not implement this interface)
  //    and dispatch pipeline start/stop calls to them.

  //each Runner has its own status transition rules

  // pipeline name
  public String getName();

  // pipeline revision
  public String getRev();

  // pipeline title
  public String getPipelineTitle() throws PipelineException;

  // resets the pipeline offset, only if the pipeline is not running
  // it must assert the current status
  public void resetOffset(String user) throws PipelineException;

  public SourceOffset getCommittedOffsets() throws PipelineException;

  public void updateCommittedOffsets(SourceOffset sourceOffset) throws PipelineException;

  // pipeline status
  public PipelineState getState() throws PipelineStoreException;

  // called on startup, moves runner to disconnected state if necessary
  void prepareForDataCollectorStart(String user) throws PipelineException;

  // called for all existing pipelines when the data collector starts
  // it should reconnect/reset-status of all pipelines
  // returns whether to start the pipeline on sdc start
  public void onDataCollectorStart(String user) throws PipelineException, StageException;

  // called for all existing pipelines when the data collector is shutting down
  // it should disconnect/reset-status of all pipelines
  public void onDataCollectorStop(String user) throws PipelineException;

  // stops the pipeline
  public void stop(String user) throws PipelineException;

  // Force quit the pipeline that's already in STOPPING state
  public void forceQuit(String user) throws PipelineException;

  // Sets the state to STARTING. Should be called before doing a start on async runners.
  public void prepareForStart(String user, Map<String, Object> attributes) throws PipelineException;

  // Sets the state to STOPPING. Should be called before doing a stop on async runners.
  public void prepareForStop(String user) throws PipelineException;

  // starts the pipeline
  public void start(String user) throws PipelineException, StageException;

  // starts the pipeline with parameterization support
  public void start(String user, Map<String, Object> runtimeParameters) throws PipelineException, StageException;

  // starts the pipeline and then triggers a snapshot request
  public void startAndCaptureSnapshot(
      String user,
      Map<String, Object> runtimeParameters,
      String snapshotName,
      String snapshotLabel,
      int batches,
      int batchSize
  ) throws PipelineException, StageException;

  // triggers a snapshot request
  // delegates to SnapshotStore
  public String captureSnapshot(String user, String snapshotName, String snapshotLabel, int batches, int batchSize)
      throws PipelineException;

  // Update Snapshot label
  public String updateSnapshotLabel(String snapshotName, String snapshotLabel)
      throws PipelineException;

  // retrieves a snapshot base on its ID
  // delegates to SnapshotStore
  public Snapshot getSnapshot(String id) throws PipelineException;

  // lists all available snapshots
  // delegates to SnapshotStore
  public List<SnapshotInfo> getSnapshotsInfo() throws PipelineException;

  // deletes a snapshot
  // delegates to SnapshotStore
  public void deleteSnapshot(String id) throws PipelineException;

  // the pipeline history
  // delegates to the the PipelineStateStore
  public List<PipelineState> getHistory() throws PipelineStoreException;

  public void deleteHistory() throws PipelineException;

  // gets the current pipeline metrics
  public Object getMetrics() throws PipelineException;

  // returns error records for a give stage
  // delegates to the ErrorStore
  public List<Record> getErrorRecords(String stage, int max) throws PipelineRunnerException, PipelineStoreException;

  // returns pipeline error for a give stage
  // delegates to the ErrorStore
  public List<ErrorMessage> getErrorMessages(String stage, int max) throws PipelineRunnerException, PipelineStoreException;

  public List<SampledRecord> getSampledRecords(String sampleId, int max) throws PipelineRunnerException, PipelineStoreException;

  public List<AlertInfo> getAlerts() throws PipelineException;

  public boolean deleteAlert(String alertId) throws PipelineException;

  Collection<CallbackInfo> getSlaveCallbackList(CallbackObjectType callbackObjectType);

  void close();

  void updateSlaveCallbackInfo(CallbackInfo callbackInfo);

  Map getUpdateInfo();

  String getToken();

  int getRunnerCount();

}
