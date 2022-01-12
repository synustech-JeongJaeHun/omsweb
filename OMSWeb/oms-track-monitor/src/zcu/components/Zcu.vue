<script setup lang="ts">
import { Zcu } from '../types/zcu'
const props = defineProps<{
  zcu: Zcu
}>()
</script>

<template>
  <svg :x="props.zcu.x" :y="props.zcu.y" style="overflow: visible">
    <path d="M 0 -50 L 50 0 L 0 50 L -50 0 Z" stroke="black" stroke-width="10" fill="none" />
    <!-- <circle r="50" fill="blue" /> -->
    <text y="70">{{ props.zcu.id }}</text>
  </svg>
</template>