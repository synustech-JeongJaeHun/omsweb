<script setup lang="ts">
import { rotationInfo } from '../rotate';
import { mapSizePropertiesInfo } from 'MapObjects/map/mapSizeProperties';
</script>

<template>
  <g
    :transform="`rotate(${rotationInfo} ${mapSizePropertiesInfo.centerX} ${mapSizePropertiesInfo.centerY})`"
  >
    <slot />
  </g>
</template>