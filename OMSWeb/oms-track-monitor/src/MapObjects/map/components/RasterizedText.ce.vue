<script setup lang="ts">
// import { convertStringToImageDataUrl } from 'src/utils/textToImage';
// import { computed, readonly } from 'vue';
const props = defineProps<{
  text: string
}>()
// const rasterized = readonly(computed(() => convertStringToImageDataUrl(props.text)))
</script>

<template>
  <!-- <image v-if="rasterized" :href="rasterized.dataURL" /> -->
  <text class="select-none" text-rendering="optimizeSpeed">{{ props.text }}</text>
</template>