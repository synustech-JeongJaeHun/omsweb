<script setup lang="ts">
import { Segment } from '../types/Segment'
import { getSegmentPathId } from '../utils/segment'
import { computed, inject, readonly } from 'vue';
import SegmentDirection from './SegmentDirection.ce.vue';
import { RootEmitInjectionKey, RootEmits } from '../../types/RootEmits';
import { deepCopy } from '../../utils/deepCopy';

const DefaultStrokeWidth = 20

const props = defineProps<{
  segment: Segment
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const color = readonly(computed(() => props.segment.disabled ? 'purple' : 'grey'))

function onTooltipOn() {
  emit('tooltipon', {
    type: 'Segment',
    value: deepCopy(props.segment)
  })
}
function onTooltipOff() {
  emit('tooltipoff')
}
function onContextmenu() {
  emit('contextmenuon', {
    type: "Segment",
    value: deepCopy(props.segment)
  })
}

</script>

<template>
  <svg ref="selfElement" class="overflow-visible cursor-pointer">
    <use
      :href="`#${getSegmentPathId(props.segment.id)}`"
      :stroke="color"
      :stroke-width="DefaultStrokeWidth"
      @click.right="onContextmenu()"
      @mouseover="onTooltipOn()"
      @mouseout="onTooltipOff()"
      @mouseleave="onTooltipOff()"
    />
    <SegmentDirection :d="props.segment.d" :color="color" />
  </svg>
</template>