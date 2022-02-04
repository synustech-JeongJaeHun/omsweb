<script setup lang="ts">
import { rotationInfo } from '../../map/rotate';
</script>

<template>
  <g :transform="`rotate(${(-1) * rotationInfo})`">
    <slot />
  </g>
</template>