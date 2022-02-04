<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Buffer from './Buffer.ce.vue';

import { buffers } from '../buffers'

</script>

<template>
  <Layer>
    <defs>
      <!-- <polygon id="buffer" points="30,60 60,30 60,-30 30,-60 -30,-60 -60,-30 -60,30 -30,60" /> -->
      <!-- <polygon
        id="buffer-group-shadow"
        points="20,40 40,20 40,-20 20,-40 -20,-40 -40,-20 -40,20 -20,40"
      />-->
      <circle id="buffer" r="50" stroke="black" stroke-width="10" fill="none" />
      <circle id="buffer-group-shadow" r="60" />
    </defs>

    <Buffer v-for="buffer of buffers" :key="buffer.id" :buffer="buffer" />
  </Layer>
</template>
