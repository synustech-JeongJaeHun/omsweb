<script setup lang="ts">
import { computed, toRef } from 'vue'
import { Buffer } from '../types/Buffer'
import { useGroup } from '../../group/groups'
import { getPositionForBufferOrStation } from 'src/TrackObjects/utils/locationStationBuffer'
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'

const props = defineProps<{
  buffer: Buffer
  margin: number
  handleLeftClick: (event: MouseEvent) => void
  handleRightClick: (event: MouseEvent) => void
  handleMouseover: (event: MouseEvent) => void
  handleMouseleave: (event: MouseEvent) => void
}>()

const position = computed(() =>
  getPositionForBufferOrStation(props.buffer, props.margin)
)

const group = useGroup('buffer', toRef(props.buffer, 'id'))
</script>

<template>
  <svg
    v-if="position"
    class="overflow-visible cursor-pointer buffer"
    :x="position.x"
    :y="position.y"
    :data-disabled="props.buffer.unuse"
    :data-carrier-focused="props.buffer.isCarrierFocused"
  >
    <g class="scale-and-reverse-rotate">
      <use
        v-if="group"
        class="group-shadow"
        href="#buffer-group-shadow"
        :fill="getGroupColorWithAlpha(group.color)"
      />
      <use
        v-if="props.buffer.isFocused"
        href="#buffer"
        class="focus"
        stroke-width="10"
      />
      <use
        href="#buffer"
        class="buffer-path"
        stroke-width="4"
        :data-id="props.buffer.id"
        @click.left="handleLeftClick"
        @click.right="handleRightClick"
        @mouseover="handleMouseover"
        @mouseout="handleMouseleave"
        @mouseleave="handleMouseleave"
      />
      <circle 
        v-if="props.buffer.carrierId"
        class="buffer-full"
        r="8"
      />
      <text
        class="invert label select-none"
        x="0"
        y="20"
        alignment-baseline="hanging"
        text-anchor="middle"
        text-rendering="optimizeSpeed"
        pointer-events="none"
      >
        {{ props.buffer.logicalId }}
      </text>
    </g>
  </svg>
</template>
