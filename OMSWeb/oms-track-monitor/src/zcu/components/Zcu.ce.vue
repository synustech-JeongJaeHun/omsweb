<script setup lang="ts">
import { Zcu } from '../types/Zcu'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';

const props = defineProps<{
  zcu: Zcu
}>()
</script>

<template>
  <svg class="overflow-visible" :x="props.zcu.x" :y="props.zcu.y">
    <path d="M 0 -50 L 50 0 L 0 50 L -50 0 Z" stroke="black" stroke-width="10" fill="none" />
    <!-- <circle r="50" fill="blue" /> -->
    <RasterizedText y="70" :text="String(props.zcu.id)" />
    <!-- <image y="70" :href="rasterisedIdTextImageDataUrl" /> -->
    <!-- <text y="70">{{ props.zcu.id }}</text> -->
  </svg>
</template>