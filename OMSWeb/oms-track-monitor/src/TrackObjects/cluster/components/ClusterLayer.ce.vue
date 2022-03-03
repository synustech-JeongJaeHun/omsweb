<script setup lang="ts">
import { visibleStylesInfo } from 'src/styles/styles';
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import { Color } from 'src/types/Color';
import { clusters } from '../clusters'
import { scaleStylesInfo } from 'src/styles/styles';
</script>

<template>
  <Layer id="cluster-layer" :data-is-cluster-visible="visibleStylesInfo.cluster">
    <path
      v-for="cluster of clusters"
      :key="cluster.id"
      class="cluster fixed-scale-stroke"
      fill="none"
      :stroke="Color[cluster.color]"
      :stroke-width="scaleStylesInfo.segmentWidth * 2.5"
      :d="cluster.d"
    />
  </Layer>
</template>
