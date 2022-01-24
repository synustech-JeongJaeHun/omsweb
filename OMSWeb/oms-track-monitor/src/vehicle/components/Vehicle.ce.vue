<script setup lang="ts">
import { Vehicle } from '../types/Vehicle'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { findPointById } from '../../point/points';
import { reactive, ref, watch } from 'vue';
import { findSegmentByPoints } from '../../segment/segments';
import { getPositionFromD } from '../../utils/svg/path';
import { Segment } from '../../segment/types/Segment';
import { encodeCommandsToD, moveTo, slicePathCommands } from '../../utils/svg/pathSegment';

const props = defineProps<{
  vehicle: Vehicle
}>()

const
  currentPosition = reactive({ x: 0, y: 0 }),
  currentSegment = ref<Segment>()
const
  beforePosition = reactive({ x: 0, y: 0 }),
  beforeSegment = ref<Segment>()

const
  animateMotionRef = ref<SVGAnimateMotionElement>(),
  animateMotionPath = ref('M 0 0')

watch(() => props.vehicle.lastUpdated, () => {
  const segment = findSegmentByPoints(props.vehicle.curPoint, props.vehicle.nextPoint)
  const { x, y } =
    segment
      ? getPositionFromD(encodeCommandsToD(segment.pathCommands), props.vehicle.distancePoint)
      : findPointById(props.vehicle.curPoint) ?? { x: 0, y: 0 }

  // current => before
  beforePosition.x = currentPosition.x
  beforePosition.y = currentPosition.y
  beforeSegment.value = currentSegment.value

  // v => current
  currentPosition.x = x
  currentPosition.y = y
  currentSegment.value = segment ?? currentSegment.value

  const pathCommands = (function () {
    if (props.vehicle.updateType === 'AnimationIn2Segments' && currentSegment.value && beforeSegment.value) {
      const concatenatedCommands = [
        ...beforeSegment.value.pathCommands,
        ...currentSegment.value.pathCommands.slice(1)
      ]
      return slicePathCommands(concatenatedCommands, beforePosition, currentPosition)
    }

    if (props.vehicle.updateType === 'AnimationIn1Segment' && beforeSegment.value)
      return slicePathCommands(beforeSegment.value.pathCommands, beforePosition, currentPosition)

    const currentPositionPathCommands = [moveTo(currentPosition)]
    if (props.vehicle.updateType === 'NoAnimation')
      return currentPositionPathCommands
    return currentPositionPathCommands
  })()

  animateMotionPath.value = encodeCommandsToD(pathCommands)
  animateMotionRef.value?.beginElement()
})

</script>

<template>
  <svg class="overflow-visible cursor-pointer">
    <use href="#vehicle">
      <RasterizedText y="70" :text="props.vehicle.logicalId" />
      <animateMotion ref="animateMotionRef" fill="freeze" dur="1s" :path="animateMotionPath" />
    </use>
  </svg>
</template>