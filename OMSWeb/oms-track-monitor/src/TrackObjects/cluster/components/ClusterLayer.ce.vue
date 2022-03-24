<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import { Color } from 'src/types/Color'
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits'
import { deepCopy } from 'src/utils/deepCopy'
import { inject } from 'vue'
import { clusters, findClusterById } from '../clusters'

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
  <Layer id="cluster-layer">
    <path
      v-for="cluster of clusters"
      :key="cluster.id"
      class="cluster fixed-scale-stroke"
      fill="none"
      :stroke="Color[cluster.color]"
      :d="cluster.d"
      :data-id="cluster.id"
      @mouseover="onMouseover"
      @mouseleave="onMouseleave"
      @mouseout="onMouseleave"
    />
  </Layer>
</template>
