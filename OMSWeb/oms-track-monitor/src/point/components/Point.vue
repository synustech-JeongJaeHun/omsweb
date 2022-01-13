<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { convertStringToImageDataUrl } from '../../utils/textToImage';
import { Point } from '../types/Point'

const props = defineProps<{
  point: Point
}>()

const rasterisedIdTextImageDataUrl = ref<string>('')
watchEffect(async () => {
  const dataUrl = await convertStringToImageDataUrl(props.point.logicalId)
  rasterisedIdTextImageDataUrl.value = dataUrl
})
</script>


<template>
  <svg :x="props.point.x" :y="props.point.y" style="overflow: visible">
    <!-- <circle r="50" fill="black" /> -->
    <use href="#point" />
    <image y="70" :href="rasterisedIdTextImageDataUrl" />
    <!-- <text y="70">{{ props.point.logicalId }}</text> -->
  </svg>
</template>