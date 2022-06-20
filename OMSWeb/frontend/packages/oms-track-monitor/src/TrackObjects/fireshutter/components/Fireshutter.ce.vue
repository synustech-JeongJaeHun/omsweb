<script setup lang="ts">
import { Fireshutter } from '../types/Fireshutter'
import FireshutterOpen from '../assets/FireshutterOpen.svg?component'
import FireshutterClose from '../assets/FireshutterClose.svg?component'
// vue3 && ts에서 props를 정의하는 방법임
const props = defineProps<{
  fireshutter: Fireshutter
  handleMouseover(event: MouseEvent): void
  handleMouseleave(event: MouseEvent): void
  handleLeftClick(event: MouseEvent): void
  handleRightClick(event: MouseEvent): void
}>()
</script>

<template>
  <svg
    :x="props.fireshutter.x"
    :y="props.fireshutter.y"
    class="fireshutter-wrapper overflow-visible"
  >
    <FireshutterOpen
      v-if="props.fireshutter.status === 'OPEN'"
      :x="50"
      :y="100"
      :data-id="props.fireshutter.id"
      class="overflow-visible"
      @click.left="handleLeftClick"
      @mouseover="handleMouseover"
      width="50"
      height="50"
    />
    <FireshutterClose
      v-if="props.fireshutter.status === 'CLOSE'"
      :x="50"
      :y="100"
      class="overflow-visible"
      @click.left="handleLeftClick"
      @mouseover="handleMouseover"
      :data-id="props.fireshutter.id"
      width="50"
      height="50"
    />
  </svg>
</template>
