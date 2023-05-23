<script setup lang="ts">
import { computed, toRef } from 'vue'
import { Buffer } from '../types/Buffer'
import { useGroup } from '../../group/groups'
import { getPositionForBufferOrStation } from 'src/TrackObjects/utils/locationStationBuffer'
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'
import { readonlyIdType, IdType } from 'TrackObjects/common/alias'

const props = defineProps<{
  buffer: Buffer
  margin: number
  teleportRef?: SVGGElement
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
  <Teleport :to="teleportRef" :disabled="props.buffer.isCarrierFocused !== true">
    <svg
      v-if="position"
      class="overflow-visible cursor-pointer buffer"
      :x="position.x"
      :y="position.y"
      :data-disabled="props.buffer.unuse"
      :data-state="props.buffer.state"
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
          :data-id="props.buffer.id"
          :class="props.buffer.carrierId && 'buffer-full'"
          :fill="!props.buffer.carrierId &&'transparent'"
          r="8"
          @click.left="handleLeftClick"
          @click.right="handleRightClick"
          @mouseover="handleMouseover"
          @mouseout="handleMouseleave"
          @mouseleave="handleMouseleave"
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
          {{ readonlyIdType===IdType.ID ? props.buffer.logicalId : props.buffer?.cAlias}}
        </text>
      </g>
    </svg>
  </Teleport>
</template>
