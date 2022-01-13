<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { convertStringToImageDataUrl } from '../../utils/textToImage'
import { Zcu } from '../types/zcu'
const props = defineProps<{
  zcu: Zcu
}>()

const rasterisedIdTextImageDataUrl = ref<string>('')
watchEffect(async () => {
  const dataUrl = await convertStringToImageDataUrl(String(props.zcu.id))
  rasterisedIdTextImageDataUrl.value = dataUrl
})
</script>

<template>
  <svg :x="props.zcu.x" :y="props.zcu.y" style="overflow: visible">
    <path d="M 0 -50 L 50 0 L 0 50 L -50 0 Z" stroke="black" stroke-width="10" fill="none" />
    <!-- <circle r="50" fill="blue" /> -->
    <image y="70" :href="rasterisedIdTextImageDataUrl" />
    <!-- <text y="70">{{ props.zcu.id }}</text> -->
  </svg>
</template>