<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import { Color } from '../../types/Color';
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
      :stroke="Color[cluster.color]"
      stroke-width="100"
      :d="cluster.d"
    />
  </Layer>
</template>
