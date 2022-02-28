<script setup lang="ts">
import { useScreenFixedScale } from 'src/MapObjects/scale/scale';
import { ref } from 'vue';

const size = ref(1)
const threshold = 50
const r = useScreenFixedScale(size, threshold)
</script>

<template>
  <circle id="point-circle" :r="r" />
</template>
