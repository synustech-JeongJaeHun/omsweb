import { ITrackData } from 'src/legacies/models/track.model'
import { ref } from 'vue'
import { segments } from '../segment/segments'
import { Cluster } from './types/Cluster'
import { makeClustersFromSegments } from './utils/cluster'

const clusters = ref<Cluster[]>([])

function initClusters(cs: ITrackData['clusters']) {
  clusters.value = makeClustersFromSegments(cs ?? [], segments.value)
}

export { clusters, initClusters }
