<script setup lang="ts">
import { Fireshutter } from '../types/Fireshutter'
import FireshutterOpen from '../assets/FireshutterOpen.svg?component'
import FireshutterClose from '../assets/FireshutterClose.svg?component'
import {ColorDefault} from "src/styles/styles";
import {parseStringProp} from "src/Root/utils/props";
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
      v-if="props.fireshutter.open === 1"
      :x="50"
      :y="100"
      :data-fireDetect="props.fireshutter.fireDetect"
      class="overflow-visible"
      @click.left="handleLeftClick"
      @mouseover="handleMouseover"
      @mouseleave="handleMouseleave"
      width="35"
      height="35"
      :fill="props.fireshutter.fireDetect ? parseStringProp(ColorDefault.fireshutterOpened, props.fireshutterOpenedColor)
      :parseStringProp(ColorDefault.fireshutterClosed, props.fireshutterClosedColor)"
    />
    <FireshutterClose
      v-if="props.fireshutter.open === 0"
      :x="50"
      :y="100"
      class="overflow-visible"
      @click.left="handleLeftClick"
      @mouseover="handleMouseover"
      @mouseleave="handleMouseleave"
      :data-fireDetect="props.fireshutter.fireDetect"
      width="35"
      height="35"
      :fill="props.fireshutter.fireDetect ? parseStringProp(ColorDefault.fireshutterOpened, props.fireshutterOpenedColor)
      :parseStringProp(ColorDefault.fireshutterClosed, props.fireshutterClosedColor)"
    />
  </svg>
</template>
