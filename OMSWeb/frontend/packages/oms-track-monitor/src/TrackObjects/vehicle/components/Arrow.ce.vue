<script setup lang="ts">
import { Position } from 'src/types/Position'
import {getAngleFromTwoPoints} from "src/utils/angle";
import {ComplicatedMode} from "TrackObjects/vehicle/types/Vehicle";

const props = defineProps<{
  source: Position
  dest: Position
  complicatedMode: ComplicatedMode 
}>()
</script>

<template>
  <svg class="overflow-visible vehicle-symbol" 
       :data-complicated-mode="props.complicatedMode"
       :x="`${props.source.x}`" :y="`${props.source.y}`" >
    <g class="scale-arrow">
      <g :transform="`rotate(${getAngleFromTwoPoints(props.source, props.dest)}) translate(-12,3)`">
        <path class="vehicle-mode-path" stroke="black" stroke-width="0.5"
            d="m9.001 13.022h-3.251c-.412 0-.75.335-.75.752 0 .188.071.375.206.518 1.685 1.775 4.692 4.945 6.069 6.396.189.2.452.312.725.312.274 0 .536-.112.725-.312 1.377-1.451 4.385-4.621 6.068-6.396.136-.143.207-.33.207-.518 0-.417-.337-.752-.75-.752h-3.251v-9.02c0-.531-.47-1.002-1-1.002h-3.998c-.53 0-1 .471-1 1.002z" 
              fill-rule="nonzero"/>
      </g>
    </g>
  </svg>
</template>
