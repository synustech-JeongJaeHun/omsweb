<script setup lang="ts">
import { Backdrop } from '../types/Backdrop'
import {computed} from "vue";

const props = defineProps<{
  backdrop: Backdrop
}>()

console.log(props.backdrop.contents)
const position = computed(() =>
    getPositionAlign(props.backdrop)
)

function getPositionAlign(
    backdrop: Backdrop    
) {
  let position = {
    x: 0,
    y: 0,
    anchor: ''
  }
  switch (backdrop.hAlign){
    case 1: // align center
      position.x = 0;
      position.anchor = 'middle'
          break;
    case 2: // align right
      position.x = backdrop.width || 0;
      position.anchor = 'end'
          break;
    default: // align left
      position.x = 0;
      position.anchor = 'start'
          break;
  }

  switch (backdrop.vAlign){
    case 1: // align middle
      position.y = 0;
      position.anchor = 'middle'
      break;
    case 2: // align bottom
      position.y = backdrop.width || 0;
      position.anchor = 'end'
      break;
    default: // align top
      position.y = 0;
      position.anchor = 'start'
      break;
  }
    
  return position
}
</script>

<template>
  <svg
      :x="props.backdrop.x"
      :y="props.backdrop.y"
  >
    <g class="scale-and-reverse-rotate">
      <rect :width="props.backdrop.width"
            :height="props.backdrop.height"
            :fill="props.backdrop.backgroundColor"
            :stroke="props.backdrop.outlineColor"
            :stroke-width="props.backdrop?.outlineThickness"
            :stroke-dasharray="!props.backdrop?.outlineType ? false : '20 4'"
            :rx="props.backdrop.outlineRadius"
      >
      </rect>
      <text :x="position.x"
            :y="-props.backdrop.y"
            :text-anchor="position.anchor"
            fill="black"
            class="invert label select-none"
            alignment-baseline="hanging"
            text-rendering="optimizeSpeed"
            pointer-events="none"
            :font-size="props.backdrop?.fontSize">
        {{ props.backdrop.contents }}
      </text>
    </g>
  </svg>
</template>
