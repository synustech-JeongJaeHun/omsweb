<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { convertStringToImageDataUrl } from '../../utils/textToImage';

const props = defineProps<{
  text: string,
}>()

const imageDataUrl = ref<string>()
watchEffect(async () => {
  imageDataUrl.value = await convertStringToImageDataUrl(props.text)
})

</script>

<template>
  <image v-if="imageDataUrl" :href="imageDataUrl" data-show-zoom-level-equal-or-bigger="3" />
</template>