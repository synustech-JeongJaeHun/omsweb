<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import { Color } from 'src/types/Color';
import { clusters } from '../clusters'
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
    />
  </Layer>
</template>
