<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Mtl from './Mtl.ce.vue';
import { mtls } from '../mtls'

</script>

<template>
  <Layer>
    <defs>
      <path
        id="mtl"
        fill="none"
        d="M -50 -50 
          L -25 0
          L -50 50
          L 50 50
          L 25 0
          L 50 -50"
      />
    </defs>

    <Mtl v-for="mtl of mtls" :key="mtl.id" :mtl="mtl" />
  </Layer>
</template>