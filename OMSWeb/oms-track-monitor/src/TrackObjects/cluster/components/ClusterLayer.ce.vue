<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import { Color } from 'src/types/Color';
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits';
import { deepCopy } from 'src/utils/deepCopy';
import { inject } from 'vue';
import { clusters } from '../clusters'
import { Cluster } from '../types/Cluster';

const emit = inject<RootEmits>(RootEmitInjectionKey)!

function onMouseover(cluster: Cluster, event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: "CLUSTER",
    value: deepCopy(cluster),
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
      @mouseover="onMouseover(cluster, $event)"
      @mouseleave="onMouseleave()"
      @mouseout="onMouseleave()"
    />
  </Layer>
</template>
