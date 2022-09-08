type ClusterState = {
  id: number // clusterState.id is clusterState.server_id
  converterId: number
  /**
   * - 0: RUN
   * - 1: STOP
   * - 2: FAULT
   * - 3: WARNING
   * - 4: Fail-Over Operation
   * - 5: Common Fail
   */
  status: number 
  backupId: number
}

export { ClusterState }
