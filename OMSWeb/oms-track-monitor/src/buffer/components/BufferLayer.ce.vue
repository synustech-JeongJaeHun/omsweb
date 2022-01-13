<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Buffer from './Buffer.ce.vue';

import { buffers } from '../buffers'

</script>

<template>
  <Layer>
    <defs>
      <circle id="buffer" r="50" stroke="black" stroke-width="10" fill="none" />
    </defs>

    <Buffer v-for="buffer of buffers" :key="buffer.id" :buffer="buffer" />
  </Layer>
</template>
