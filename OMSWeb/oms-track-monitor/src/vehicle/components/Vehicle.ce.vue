<script setup lang="ts">
import { Vehicle } from '../types/Vehicle'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { findPointById } from '../../point/points';
import { reactive, ref, toRef, watch } from 'vue';
import { findSegmentByPoints } from '../../segment/segments';
import { createPathElement, getPositionFromD } from '../../utils/svg/path';
import { Segment } from '../../segment/types/Segment';
import { encodeCommandsToD, moveTo, slicePathCommands } from '../../utils/svg/pathSegment';
import { useGroupColor } from '../../group/groups';
import { D } from '../../types/D';
import MapReverseRotate from '../../rotate/components/MapReverseRotate.ce.vue';

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
  realtimePosition = reactive({ x: 0, y: 0 })

// const
// animateMotionRef = ref<SVGAnimateMotionElement>(),
// animateMotionPath = ref('M 0 0')

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
  currentSegment.value = segment ?? currentSegment.value

  // v => realtime
  realtimePosition.x = x
  realtimePosition.y = y

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

  const d = encodeCommandsToD(pathCommands)

  // animateMotionPath.value = d
  // animateMotionRef.value?.beginElement()
  if (props.vehicle.updateType !== 'NoAnimation')
    trackVehiclePosition(d)
})

function trackVehiclePosition(d: D) {
  const pathElement = createPathElement(d)
  const totalLength = pathElement.getTotalLength()
  // https://developer.mozilla.org/ko/docs/Web/API/Performance/now
  const startTime = performance.now()

  function step(now: DOMHighResTimeStamp) {
    // time with microsecond
    // animation duration 0.3s with linear
    const diff = now - startTime
    if (diff > 300) {
      const endPosition = pathElement.getPointAtLength(totalLength)
      realtimePosition.x = endPosition.x
      realtimePosition.y = endPosition.y
      return
    }

    const position = pathElement.getPointAtLength(totalLength / 300 * diff)
    realtimePosition.x = position.x
    realtimePosition.y = position.y

    globalThis.requestAnimationFrame(step)
  }

  // https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame
  globalThis.requestAnimationFrame(step)
}

const groupColor = useGroupColor('vehicle', toRef(props.vehicle, 'id'))

</script>

<template>
  <symbol class="overflow-visible cursor-pointer" :id="`vehicle-${props.vehicle.id}`">
    <circle v-show="groupColor" class="group-shadow" r="120" :fill="groupColor" />
    <circle r="80" fill="none" stroke="red" stroke-width="20" />
    <!-- <text y="70">{{ props.vehicle.logicalId }}</text> -->
    <MapReverseRotate>
      <RasterizedText class="invert" y="100" :text="props.vehicle.logicalId" />
    </MapReverseRotate>
  </symbol>

  <use :href="`#vehicle-${props.vehicle.id}`" :x="realtimePosition.x" :y="realtimePosition.y" />
  <!-- <animateMotion ref="animateMotionRef" fill="freeze" dur="0.3s" :path="animateMotionPath" /> -->

  <line
    :x1="realtimePosition.x"
    :y1="realtimePosition.y"
    x2="23000"
    y2="30000"
    stroke="blue"
    stroke-width="22"
    stroke-linecap="round"
    marker-end="url(#vehicle-line-blue)"
  />
</template>