<script setup lang="ts">
import { FireShutter } from '../types/Fireshutter'
import FireshutterOpen from '../assets/FireshutterOpen.svg?component'
import FireshutterClose from '../assets/FireshutterClose.svg?component'
// vue3 && ts에서 props를 정의하는 방법임
const props = defineProps<{
  fireshutter: FireShutter
}>()
</script>

<template>
  <FireshutterOpen
    v-if="props.fireshutter.status === 'OPEN'"
    :x="props.fireshutter.x"
    :y="props.fireshutter.y"
    width="1000"
    height="1000"
  />
  <FireshutterClose
    v-if="props.fireshutter.status === 'CLOSE'"
    :x="props.fireshutter.x"
    :y="props.fireshutter.y"
    width="1000"
    height="1000"
  />

  <p style="z-index: 9999">Component Mount Test</p>
</template>
