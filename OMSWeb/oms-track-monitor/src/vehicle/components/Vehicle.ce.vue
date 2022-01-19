<script setup lang="ts">
import { Vehicle } from '../types/Vehicle'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { findPointById } from '../../point/points';
import { reactive, ref, watch } from 'vue';
import { findSegmentByPoints } from '../../segment/segments';
import { encodeSVGPath, SVGPathData } from 'svg-pathdata'
import { getPositionFromD } from '../../utils/path';
import { Segment } from '../../segment/types/Segment';
import { SVGCommand } from 'svg-pathdata/lib/types';
import { sliceDFromSVGCommands } from '../utils/move';

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
      ? getPositionFromD(segment.d, props.vehicle.distancePoint)
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

          const { commands } = new SVGPathData(segment.d)
          return sliceDFromSVGCommands(commands, beforePosition, currentPosition)
        }
      case "AnimationIn2Segments":
        {
          if (segment === undefined || beforeSegment.value === undefined)
            return currentPositionPath;

          const { commands: beforeSegmentCommands } = new SVGPathData(beforeSegment.value.d)
          const { commands: currentSegmentCommands } = new SVGPathData(segment.d)

          const concatenatedCommands: SVGCommand[] = [
            ...beforeSegmentCommands,
            ...currentSegmentCommands.slice(1)
          ]
          return sliceDFromSVGCommands(concatenatedCommands, beforePosition, currentPosition)
        }
      default:
        return currentPositionPath
    }
  })()

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