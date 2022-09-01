<script setup lang="ts">
import { computed, toRef } from 'vue';
import { Cluster } from '../types/Cluster';
import { getClusterColorWithAlpha } from '../utils/color';
import { useIsClusterAlertState } from '../clusterStates'

const props = defineProps<{
  cluster: Cluster
  onMouseover: Function
  onMouseleave: Function
}>()

const isClusterAlertState = useIsClusterAlertState(toRef(props.cluster, 'id'))

const color = computed(() => {
  const clusterColor = getClusterColorWithAlpha(props.cluster.color)
  return isClusterAlertState.value ? "red" : clusterColor
})

</script>

<template>
  <path
    class="cluster fixed-scale-stroke" 
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
