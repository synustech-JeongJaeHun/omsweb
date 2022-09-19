<script setup lang="ts">
import { computed, toRef } from 'vue';
import { Cluster } from '../types/Cluster';
import { getClusterColorWithAlpha } from '../utils/color';
import { useClusterState } from '../clusterStates'

const props = defineProps<{
  cluster: Cluster
  onMouseover: Function
  onMouseleave: Function
}>()

const clusterState = useClusterState(toRef(props.cluster, 'id'))

const color = computed(() => {
  const clusterColor = getClusterColorWithAlpha(props.cluster.color)

  switch (clusterState.value) {
    case 2: // Fault
      return 'red';
    case 3: // Warning
      return 'yellow';
    case 4: // Fail-Over Opertaion
      return 'grey'
    default:
      return clusterColor;
  }
})

</script>

<template>
  <path
    class="cluster fixed-scale-stroke"
    :data-focused="props.cluster.isFocused"
    fill="none"
    :stroke="color" 
    :d="props.cluster.d" 
    :data-id="props.cluster.id" 
    @mouseover="props.onMouseover"
    @mouseleave="props.onMouseleave" 
    @mouseout="props.onMouseleave" 
  />
</template>

<style scoped>
</style>
