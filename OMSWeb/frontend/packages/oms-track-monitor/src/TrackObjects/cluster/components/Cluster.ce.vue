<script setup lang="ts">
import { computed } from 'vue';
import { Cluster } from '../types/Cluster';
import { getClusterColorWithAlpha } from '../utils/color';
import {readonlyColors} from "TrackObjects/cluster/types/clusterColors";

const props = defineProps<{
  cluster: Cluster
  onMouseover: Function
  onMouseleave: Function
}>()

//const color = computed(() => getClusterColorWithAlpha(props.cluster.color))
/*const color = readonlyColors[props.cluster.id]
console.log(color)*/
</script>

<template>
  <path
    class="cluster fixed-scale-stroke"
    :data-focused="props.cluster.isFocused"
    fill="none"
    v-bind:stroke="readonlyColors[props.cluster.id-1]" 
    :d="props.cluster.d" 
    :data-id="props.cluster.id" 
    @mouseover="props.onMouseover"
    @mouseleave="props.onMouseleave" 
    @mouseout="props.onMouseleave" 
  />
</template>

<style scoped>
</style>
