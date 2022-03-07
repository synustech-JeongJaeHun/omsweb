<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import Zcu from './Zcu.ce.vue';
import { zcus } from '../zcus'
</script>

<template>
  <Layer id="zcu-layer">
    <defs>
      <path id="zcu" d="M 0 -12 L 12 0 L 0 12 L -12 0 Z" />
    </defs>
    <Zcu v-for="zcu of zcus" :key="zcu.id" :zcu="zcu" />
  </Layer>
</template>
