<script setup lang="ts">
import { rotationInfo } from '../../map/rotate';
import { mapSizePropertiesInfo } from '../../map/mapSizeProperties';
</script>

<template>
  <g
    :transform="`rotate(${rotationInfo} ${mapSizePropertiesInfo.centerX} ${mapSizePropertiesInfo.centerY})`"
  >
    <slot />
  </g>
</template>