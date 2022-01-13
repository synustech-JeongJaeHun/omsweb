<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { convertStringToImageDataUrl } from '../../utils/textToImage';

const props = defineProps<{
  text: string,
}>()

const imageDataUrl = ref<string>(props.text)
watchEffect(async () => {
  imageDataUrl.value = await convertStringToImageDataUrl(props.text)
})

</script>

<template>
  <image :href="imageDataUrl" data-show-zoom-level-equal-or-bigger="3" />
</template>
