<script setup lang="ts">
import { Backdrop} from '../types/Backdrop'

const props = defineProps<{
  backdrop: Backdrop
}>()

function getAnchor(hAlign:number = 0): 'start' | 'middle' | 'end'{
  switch (hAlign){
    case 1:
      return 'middle'
    case 2:
      return 'end'
    default :
      return 'start' 
  }
}
function getX(hAlign:number = 0): number{
  switch (hAlign){
    case 1:
      return props.backdrop.width/2
    case 2:
      return props.backdrop.width
    default :
      return 0
  }
}

function getBaseLine(vAlign:number = 0): 'before-edge' | 'middle' | 'after-edge'{
  switch (vAlign){
    case 1:
      return 'middle'
    case 2:
      return 'after-edge'
    default :
      return 'before-edge'
  }
}
function getY(vAlign:number = 0): number{
  switch (vAlign){
    case 1:
      return -props.backdrop.height/2
    case 2:
      return 0
    default :
      return -props.backdrop.height
  }
}

// 0: horizontal, 1: vertical90, 2: vertical270, 
// 3: stack -> todo 
function getRotate(direction:number =0, vAlign:number = 0, hAlign:number = 0): string{

  let x =0, y=0, d=0;
  const h =props.backdrop.height, w=props.backdrop.width
  
  switch (direction){
    case 1:
      d=270
      switch (vAlign){
        case 1:
          y=-(w-h)/2
          break;
        case 2:
          break;
        default :
          y=-(w-h);
      }
      switch (hAlign){
        case 1:
          x=-(w+h)/2
          break;
        case 2:
          x=-w
          break;
        default :
          x=-h
          break;
      }
      break;
    case 2:
      d=90
      switch (vAlign){
        case 1:
          y=(w+h)/2
          break;
        case 2:
          y=(w)
          break;
        default :
          y=h
      }
      switch (hAlign){
        case 1:
          x=-(w-h)/2
          break;
        case 2:
          x=-(w-h);
          break;
        default :
      }
  }
  
  return `transform: rotate(${d}deg) scaleY(-1) translate(${x}px, ${y}px)`
}

function getRadius(): number{
  const h =props.backdrop.height, w=props.backdrop.width
  return Math.min(w, h)/2 < props.backdrop.outlineRadius ? Math.min(w, h)/2: props.backdrop.outlineRadius  
}
</script>

<template>
  <svg
      :x="props.backdrop.x"
      :y="props.backdrop.y"
      class="overflow-visible"
  >
    <g class="scale-and-reverse-rotate">
      <rect :width="props.backdrop.width"
            :height="props.backdrop.height"
            :fill="props.backdrop.backgroundColor"
            :stroke="props.backdrop.outlineColor"
            :stroke-width="props.backdrop?.outlineThickness"
            :stroke-dasharray="!props.backdrop?.outlineType ? false : '20 4'"
            :rx="getRadius()"
      >
      </rect>
      <text 
            :x="getX(props.backdrop.hAlign)"
            :y="getY(props.backdrop.vAlign)"
            :text-anchor="getAnchor(props.backdrop.hAlign)"
            :alignment-baseline="getBaseLine(props.backdrop.vAlign)"
            class="label select-none"
            :font-weight="props.backdrop?.bold ? 'bold' : 'normal'"
            :font-style="props.backdrop?.italic ? 'italic' : 'normal'"
            :style="getRotate(props.backdrop?.direction, props.backdrop.vAlign, props.backdrop.hAlign)"
            :font-size="props.backdrop?.fontSize"
            :fill="props.backdrop?.textColor"
      >
        {{ props.backdrop.contents }}
      </text>
    </g>
  </svg>
</template>
