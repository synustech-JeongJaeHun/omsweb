<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import { ClusterColor } from '../types/ClusterColor';
import { encodeCommandsToD } from '../../utils/svg/pathSegment';

import { clusters } from '../clusters'

</script>

<template>
  <Layer>
    <path
      v-for="cluster of clusters"
      :key="cluster.id"
      class="cluster"
      fill="none"
      :stroke="ClusterColor[cluster.color]"
      stroke-width="100"
      :d="encodeCommandsToD(cluster.pathCommands)"
    />
  </Layer>
</template>
