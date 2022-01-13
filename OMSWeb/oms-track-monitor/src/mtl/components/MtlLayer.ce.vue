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
        fill="black"
        d="m-13.5 13.5 l4.5 -4.5 l-4.5 -4.5 l4.5 -4.5 l-4.5 -4.5 l4.5 -4.5 l-4.5 -4.5 l27 0 l-4.5 4.5 l4.5 4.5 l-4.5 4.5 l4.5 4.5 l-4.5 4.5 l4.5 4.5 m-22.5 -22.5 l18 0"
      />
    </defs>

    <Mtl v-for="mtl of mtls" :key="mtl.id" :mtl="mtl" />
  </Layer>
</template>