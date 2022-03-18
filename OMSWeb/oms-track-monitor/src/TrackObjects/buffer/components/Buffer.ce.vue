<script setup lang="ts">
import { computed, inject, readonly, toRef } from 'vue'
import { Buffer } from '../types/Buffer'
import { useGroup } from '../../group/groups'
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits'
import { getPositionForBufferOrStation } from 'src/TrackObjects/utils/locationStationBuffer'
import { deepCopy } from 'src/utils/deepCopy'
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'

const props = defineProps<{
  buffer: Buffer
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const position = readonly(
  computed(() => getPositionForBufferOrStation(props.buffer))
)

const group = useGroup('buffer', toRef(props.buffer, 'id'))

function onMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'BUFFER',
    value: deepCopy(props.buffer),
    event,
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: 'BUFFER',
    value: deepCopy({ ...props.buffer, groupId: group.value?.id }),
  })
}
function onRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'BUFFER',
    value: deepCopy(props.buffer),
    event,
  })
}
</script>

<template>
  <svg
    v-if="position"
    class="overflow-visible cursor-pointer buffer"
    :x="position.x"
    :y="position.y"
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
        @click.left="onLeftClick()"
        @click.right="onRightClick($event)"
        @mouseover="onMouseover($event)"
        @mouseout="onMouseleave()"
        @mouseleave="onMouseleave()"
      />
      <text
        class="invert label select-none"
        x="20"
        y="0"
        alignment-baseline="hanging"
        text-rendering="optimizeSpeed"
        font-size="0.9em"
        pointer-events="none"
      >
        {{ props.buffer.logicalId }}
      </text>
    </g>
  </svg>
</template>
