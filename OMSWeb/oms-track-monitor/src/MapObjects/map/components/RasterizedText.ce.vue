<script setup lang="ts">
import { convertStringToImageDataUrl } from 'src/utils/textToImage';
import { computed, readonly } from 'vue';

const props = defineProps<{
  text: string,
}>()

const imageDataUrl = readonly(computed(() => convertStringToImageDataUrl(props.text)))

</script>

<template>
  <image v-if="imageDataUrl" :href="imageDataUrl" />
</template>