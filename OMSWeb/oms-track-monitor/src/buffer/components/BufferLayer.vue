<script setup lang="ts">
import Layer from '../../map/components/Layer.vue';
import Buffer from './Buffer.vue';

import { buffers } from '../buffers'

</script>

<template>
  <Layer>
    <Buffer v-for="buffer of buffers" :key="buffer.id" :buffer="buffer" />
  </Layer>
</template>
