<script setup lang="ts">
import Layer from '../../map/components/Layer.vue';
import Station from './Station.vue';

import { stations } from '../stations'

</script>

<template>
  <Layer>
    <Station v-for="station of stations" :key="station.id" :station="station" />
  </Layer>
</template>
