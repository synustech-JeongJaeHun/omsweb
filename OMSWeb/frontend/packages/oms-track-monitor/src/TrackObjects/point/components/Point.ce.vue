<script setup lang="ts">
import { Point } from '../types/Point'
import PointHome from '../assets/PointHome.svg?component'
import { useGroup } from 'src/TrackObjects/group/groups'
import { computed } from 'vue'
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'
import { readonlyPointType, PointType } from "TrackObjects/point/pointType";

const props = defineProps<{
  point: Point
  handleLeftClick: (event: MouseEvent) => void
  handleRightClick: (event: MouseEvent) => void
  handleMouseover: (event: MouseEvent) => void
  handleMouseleave: (event: MouseEvent) => void
}>()

const group = useGroup(
  'home',
  computed(() => props.point.homeId ?? -1)
)
</script>

<template>
  <svg
    class="overflow-visible cursor-pointer point"
    :x="props.point.x"
    :y="props.point.y"
    :data-id="props.point.id"
    :data-group-id="group?.id"
    @click.left="handleLeftClick"
    @click.right="handleRightClick"
    @mouseover="handleMouseover"
    @mouseout="handleMouseleave"
    @mouseleave="handleMouseleave"
  >
    <g class="scale-and-reverse-rotate">
      <circle v-if="props.point.isFocused" r="15" class="focus" />
      <circle r="3" class="point-path" />

      <g v-if="props.point.homeId" class="home">
        <!-- home with group -->
        <rect
          v-if="group"
          class="group-shadow"
          x="-10"
          y="-3"
          width="20"
          height="27"
          rx="4"
          ry="4"
          :fill="getGroupColorWithAlpha(group.color)"
        />
        <!-- home -->
        <PointHome
          class="home-path"
          width="16.875"
          height="26.25"
          x="-8.4375"
          y="0"
        />
      </g>

      <text
        class="invert label select-none"
        x="0"
        y="10"
        alignment-baseline="hanging"
        text-anchor="middle"
        text-rendering="optimizeSpeed"
        font-size="0.9em"
        pointer-events="none"
      >
        <template v-if="readonlyPointType===PointType.ID">
          {{props.point.logicalId}}
        </template>
        <template v-if="readonlyPointType===PointType.BCR">
          {{props.point.physicalId}}
        </template>
        <template v-if="readonlyPointType===PointType.ID_BCR">
          {{`${props.point.logicalId}(${props.point.physicalId})`}}
        </template>
        
      </text>
    </g>
  </svg>
</template>
