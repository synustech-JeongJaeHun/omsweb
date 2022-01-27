<script setup lang="ts">
import { computed, readonly } from 'vue';
import { convertStringToImageDataUrl } from '../../utils/textToImage';

const props = defineProps<{
  text: string,
}>()

const imageDataUrl = readonly(computed(() => convertStringToImageDataUrl(props.text)))

</script>

<template>
  <image v-if="imageDataUrl" :href="imageDataUrl" data-show-zoom-level-equal-or-bigger="3" />
</template>