import { ITrackData } from 'src/legacies/models/track.model'
import { ref } from 'vue'
import { segments } from '../segment/segments'
import { Cluster } from './types/Cluster'
import { makeClustersFromSegments } from './utils/cluster'

const clusters = ref<Cluster[]>([])
const clusterMap = new Map<Cluster['id'], Cluster>()

function initClusters(cs: ITrackData['clusters']) {
  clusters.value = makeClustersFromSegments(cs ?? [], segments.value)
  clusters.value.forEach((c) => clusterMap.set(c.id, c))
}

function findClusterById(id: Cluster['id']) {
  return clusterMap.get(id)
}

export { clusters, initClusters, findClusterById }
