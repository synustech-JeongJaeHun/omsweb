<script setup lang="ts">
import { useScreenFixedScale } from 'src/MapObjects/scale/scale';
import { scaleStylesInfo } from 'src/styles/styles';
import { toRef } from 'vue';

const threshold = 40
const length = useScreenFixedScale(toRef(scaleStylesInfo, 'segmentDirection'), threshold)
</script>

<template>
  <path
    id="segment-direction-triangle"
    :d="
    `M 0 ${length}`
    + `L -${length} -${length}`
    + `L ${length} -${length}`
    + `Z`"
  />
</template>