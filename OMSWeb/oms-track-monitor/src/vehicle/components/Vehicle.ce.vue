<script setup lang="ts">
import { Vehicle } from '../types/Vehicle'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { findPointById } from '../../point/points';
import { reactive, ref, watch } from 'vue';
import { findSegmentByPoints } from '../../segment/segments';
import { getPositionFromD } from '../../utils/svg/path';
import { Segment } from '../../segment/types/Segment';
import { sliceDFromSVGCommands } from '../utils/move';
import { encodeCommandsToD } from '../../utils/svg/pathSegment';

const props = defineProps<{
  vehicle: Vehicle
}>()

const
  currentPosition = reactive({ x: 0, y: 0 }),
  currentSegment = ref<Segment>()
const
  beforePosition = reactive(currentPosition),
  beforeSegment = ref(currentSegment.value)

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
  currentSegment.value = segment

  const path = (function () {
    const currentPositionPath = `M ${x} ${y}`
    switch (props.vehicle.updateType) {
      case "NoAnimation":
        return currentPositionPath
      case "AnimationIn1Segment":
        {
          if (segment === undefined)
            return currentPositionPath;

          return sliceDFromSVGCommands(segment.pathCommands, beforePosition, currentPosition)
        }
      case "AnimationIn2Segments":
        {
          if (segment === undefined || beforeSegment.value === undefined)
            return currentPositionPath;

          const beforeSegmentCommands = beforeSegment.value.pathCommands
          const currentSegmentCommands = segment.pathCommands

          const concatenatedCommands = [
            ...beforeSegmentCommands,
            ...currentSegmentCommands.slice(1)
          ]
          return sliceDFromSVGCommands(concatenatedCommands, beforePosition, currentPosition)
        }
      default:
        return currentPositionPath
    }
  })()

  console.log("ANIMATION", props.vehicle.updateType, "\nPATH", path)

  animateMotionPath.value = path
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