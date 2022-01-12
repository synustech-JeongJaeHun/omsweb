<script setup lang="ts">
import { Zcu } from '../types/zcu'
const props = defineProps<{
  zcu: Zcu
}>()
</script>

<template>
  <svg :x="props.zcu.x" :y="props.zcu.y" style="overflow: visible">
    <circle r="50" fill="blue" />
    <text y="70">{{ props.zcu.id }}</text>
  </svg>
</template>