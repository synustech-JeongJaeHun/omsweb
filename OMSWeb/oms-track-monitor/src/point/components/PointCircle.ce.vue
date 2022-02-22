<script setup lang="ts">
import { ref } from 'vue';
import { useScreenFixedScale } from '../../scale/scale';

const size = ref(1)
const threshold = 50
const r = useScreenFixedScale(size, threshold)
</script>

<template>
  <circle id="point" :r="r" fill="black" />
</template>
