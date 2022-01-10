<script setup lang="ts">
import Layer from '../../map/components/Layer.vue';
import Point from './Point.vue';

import { points } from '../points'

</script>

<template>
  <Layer>
    <Point v-for="point of points" :key="point.id" :point="point" />
  </Layer>
</template>
