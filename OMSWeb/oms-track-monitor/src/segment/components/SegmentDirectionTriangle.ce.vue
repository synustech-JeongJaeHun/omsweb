<script setup lang="ts">
import { toRef } from 'vue';
import { useScreenFixedScale } from '../../scale/scale';
import { scaleStylesInfo } from '../../styles/styles';

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