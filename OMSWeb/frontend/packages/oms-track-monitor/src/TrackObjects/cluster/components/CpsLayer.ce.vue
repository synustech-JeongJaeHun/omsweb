<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import { RootEmitInjectionKey, RootEmits } from 'src/Root/types/RootEmits'
import { deepCopy } from 'src/utils/deepCopy'
import { inject } from 'vue'
import { clusters, findClusterById } from '../clusters'
import Cps from './Cps.ce.vue'

const emit = inject<RootEmits>(RootEmitInjectionKey)!

function getDeepCopiedCluster(event: MouseEvent) {
  const clusterId = parseInt((event.target as SVGElement).dataset.id!)
  const cluster = findClusterById(clusterId)!
  return deepCopy(cluster)
}

function onMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'CLUSTER',
    value: getDeepCopiedCluster(event),
    event,
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
</script>

<template>
  <Layer id="cps-layer">
    <Cps
      v-for="cluster of clusters" 
      :key="cluster.id" 
      :cluster="cluster" 
      :onMouseover="onMouseover"
      :onMouseleave="onMouseleave" 
    />
  </Layer>
</template>
