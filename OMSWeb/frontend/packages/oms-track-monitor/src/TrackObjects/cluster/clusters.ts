import { ITrackData } from 'src/legacies/models/track.model'
import { ref } from 'vue'
import { segments } from '../segment/segments'
import { Cluster } from './types/Cluster'
import { makeClustersFromSegments } from './utils/cluster'
import {UpdateDto} from "src/types/Dto";
import {clusterStates} from "TrackObjects/cluster/clusterStates";

const clusters = ref<Cluster[]>([])
const clusterMap = new Map<Cluster['id'], Cluster>()

function initClusters(cs: ITrackData['clusters']) {
	clusters.value = []
	clusterMap.clear()

	clusters.value = makeClustersFromSegments(cs ?? [], segments.value)
	clusters.value.forEach((c) => clusterMap.set(c.id, c))
}

function insertClusters(cluster: UpdateDto.Clusters) {
  const finded = findClusterById(cluster.id)

  if (finded) updateClusters(cluster)
  else clusters.value.push(cluster)
}

function updateClusters(cluster: UpdateDto.Clusters) {
  const finded = findClusterById(cluster.id)
  if (finded) {
    finded.maxVehicles = cluster.maxVehicles
  }
}

function findClusterById(id: Cluster['id']) {
	return clusterMap.get(id)
}

export { clusters, initClusters, findClusterById, updateClusters, insertClusters }
