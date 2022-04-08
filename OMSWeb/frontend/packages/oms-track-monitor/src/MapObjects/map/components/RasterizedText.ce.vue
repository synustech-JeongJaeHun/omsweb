<script setup lang="ts">
import { convertStringToImageDataUrl } from 'src/utils/textToImage'
import { computed, readonly } from 'vue'
const props = defineProps<{
  text: string
}>()
const rasterized = readonly(
  computed(() => convertStringToImageDataUrl(props.text))
)

/**
 * Currently, Not used now!
 *
 * Rendering with RasterizedText is faster,
 * but, sustaining images is very heavey load for memory.
 */
</script>

<template>
  <image v-if="rasterized" :href="rasterized.dataURL" />
</template>
