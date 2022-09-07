type ClusterState = {
  id: number // clusterState.id is clusterState.server_id
  converterId: number
  status: number
  backupId: number
}

export { ClusterState }
