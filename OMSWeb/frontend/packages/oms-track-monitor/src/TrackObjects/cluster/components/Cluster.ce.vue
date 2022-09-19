<script setup lang="ts">
import { computed } from 'vue';
import { Cluster } from '../types/Cluster';
import { getClusterColorWithAlpha } from '../utils/color';

const props = defineProps<{
  cluster: Cluster
  onMouseover: Function
  onMouseleave: Function
}>()

const color = computed(() => getClusterColorWithAlpha(props.cluster.color))
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
