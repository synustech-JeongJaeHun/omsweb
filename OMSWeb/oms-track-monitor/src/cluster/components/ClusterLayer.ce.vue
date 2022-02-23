<script setup lang="ts">
import { toRef } from 'vue';
import Layer from '../../map/components/Layer.ce.vue';
import { visibleStylesInfo } from '../../styles/styles';
import { Color } from '../../types/Color';
import { clusters } from '../clusters'

const isClusterVisible = toRef(visibleStylesInfo, 'cluster')
</script>

<template>
  <Layer id="cluster-layer" :data-is-cluster-visible="isClusterVisible">
    <path
      v-for="cluster of clusters"
      :key="cluster.id"
      class="cluster"
      fill="none"
      :stroke="Color[cluster.color]"
      stroke-width="100"
      :d="cluster.d"
    />
  </Layer>
</template>
