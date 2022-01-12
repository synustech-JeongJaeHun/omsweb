<script setup lang="ts">
import { Zcu } from '../types/zcu'
const props = defineProps<{
  zcu: Zcu
}>()
</script>

<template>
  <svg :x="props.zcu.x" :y="props.zcu.y" style="overflow: visible">
    <circle r="20" fill="blue" />
  </svg>
</template>