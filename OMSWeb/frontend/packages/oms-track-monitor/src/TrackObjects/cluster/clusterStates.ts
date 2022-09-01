import { computed, Ref, ref } from 'vue'
import { ITrackData } from 'src/legacies/models/track.model'
import { ClusterState } from './types/ClusterState'
import { UpdateDto } from 'src/types/Dto'
import { Cluster } from './types/Cluster'

const clusterStates = ref<ClusterState[]>([])

function initClusterStates(css: ITrackData['clusterStates']) {
  clusterStates.value = (css ?? []).map((cs) => ({
    id: cs.server_id,
    backupId: Number(cs.backup_id),
    converterId: cs.id, // tracks....cluster_status.id is cluster.id
    status: Number(cs.status),
  }))
}

function findIndexClusterState(converterId: ClusterState['converterId']) {
  return clusterStates.value.findIndex(
    (cs) => cs.converterId === converterId
  )
}

function insertClusterState(clusterState: UpdateDto.ClusterState) {
  clusterStates.value.push(clusterState)
}

function updateClusterState(clusterState: UpdateDto.ClusterState) {
  const findedIndex = findIndexClusterState(clusterState.converterId)

  if (findedIndex) {
    const finded = clusterStates.value[findedIndex]
    Object.assign(finded, clusterState)
  }
}

function deleteClusterState(clusterState: UpdateDto.ClusterState) {
  const findedIndex = findIndexClusterState(clusterState.converterId)
  clusterStates.value.splice(findedIndex, 1)
}

function useIsClusterAlertState(clusterId: Ref<Cluster['id']>) {
  return computed(() => {
    return clusterStates.value.some((cs) => {
      const isAlertState = cs.status === 4
      const isClusterRelated =
        cs.converterId === clusterId.value ||
        cs.backupId === clusterId.value
      return isAlertState && isClusterRelated
    })
  })
}

export {
  clusterStates,
  initClusterStates,
  insertClusterState,
  updateClusterState,
  deleteClusterState,
  useIsClusterAlertState,
}
