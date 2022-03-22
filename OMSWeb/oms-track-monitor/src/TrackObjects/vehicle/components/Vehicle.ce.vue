<script setup lang="ts">
import { computed, inject, onUnmounted, ref, toRef, watch } from 'vue'
import { Vehicle } from '../types/Vehicle'
import { findPointById, usePointPoisiton } from '../../point/points'
import { findSegmentByPoints } from '../../segment/segments'
import { Segment } from '../../segment/types/Segment'
import { useGroup } from '../../group/groups'
import { useCommandPointPosition } from '../utils/lines'
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits'
import { createPathElement, getPositionFromD } from 'src/utils/svg/path'
import { D } from 'src/types/D'
import { deepCopy } from 'src/utils/deepCopy'
import MakeDInUpdateWorker from '../utils/workers/MakeDInUpdateWorker?worker&inline'
import { Position } from 'src/types/Position'
import VehiclePresentation from './VehiclePresentation.ce.vue'
import { moveCamera } from 'src/MapObjects/map/camera'
import { setHoveredVehicle } from '../hoveredVehicle'
import { setTrackedObject } from 'src/MapObjects/track/track'
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'
import { getRotatedPosition } from 'src/MapObjects/cameraAndRotation'

const props = defineProps<{
  vehicle: Vehicle
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!
const makeDInUpdateWorker = new MakeDInUpdateWorker()

const group = useGroup('vehicle', toRef(props.vehicle, 'id'))

const isHotlot = computed(() => Number(props.vehicle.priority) === 99),
  isStale = computed(() => {
    // TODO: stale 상태는 db에서 받아올 수 있을 때 작업을 시작하도록 하자
    return false
  }),
  isPreventCall = computed(() => {
    if (props.vehicle.orderOrigin) {
      if (typeof props.vehicle.orderOrigin === 'string')
        return props.vehicle.orderOrigin.trim().length === 0
      else return props.vehicle.orderOrigin.length === 0
    } else return true
  }),
  isPreventPush = computed(() => props.vehicle.canBePushed === false)

const currentPosition = ref<Position>(),
  currentSegment = ref<Segment>()

const beforePosition = ref<Position>(),
  beforeSegment = ref<Segment>()

const realtimePosition = ref<Position>()

watch(
  () => props.vehicle.lastUpdated,
  () => {
    const segment = findSegmentByPoints(
      props.vehicle.curPoint,
      props.vehicle.nextPoint
    )
    const newPosition = segment
      ? getPositionFromD(segment.d, props.vehicle.distancePoint)
      : findPointById(props.vehicle.curPoint)

    // current => before
    beforePosition.value = currentPosition.value
    beforeSegment.value = currentSegment.value

    // v => current
    currentPosition.value = newPosition
      ? // DomPoint not copied by deconstructed
        { x: newPosition.x, y: newPosition.y }
      : undefined
    currentSegment.value = segment ?? currentSegment.value

    // v => realtime
    realtimePosition.value = newPosition

    makeDInUpdateWorker.postMessage(
      deepCopy({
        updateType: props.vehicle.updateType,
        lastUpdated: props.vehicle.lastUpdated,
        currentSegment: currentSegment.value,
        beforeSegment: beforeSegment.value,
        beforePosition: beforePosition.value,
        currentPosition: currentPosition.value,
      })
    )
  }
)

// time with microsecond
// animation duration 0.3s with linear
const TotalVehicleAnimationDuration = 300
function trackVehiclePosition(d: D, lastUpdated: number) {
  const pathElement = createPathElement(d)
  const totalLength = pathElement.getTotalLength()
  // https://developer.mozilla.org/ko/docs/Web/API/Performance/now
  const startTime = performance.now()

  function step(now: DOMHighResTimeStamp) {
    if (props.vehicle.lastUpdated !== lastUpdated) return

    const diff = now - startTime

    if (diff > TotalVehicleAnimationDuration) {
      const p = pathElement.getPointAtLength(totalLength)
      realtimePosition.value = { x: p.x, y: p.y }

      if (props.vehicle.isTracked) moveCamera(getRotatedPosition(p))
      globalThis.requestAnimationFrame(() => {})
    } else {
      const p = pathElement.getPointAtLength(
        (totalLength / TotalVehicleAnimationDuration) * diff
      )
      realtimePosition.value = { x: p.x, y: p.y }
      if (props.vehicle.isTracked) moveCamera(getRotatedPosition(p))

      globalThis.requestAnimationFrame(step)
    }
  }

  // https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame
  globalThis.requestAnimationFrame(step)
}

makeDInUpdateWorker.addEventListener(
  'message',
  (e: MessageEvent<{ d: string; lastUpdate?: number }>) => {
    if (e.data.lastUpdate)
      trackVehiclePosition(e.data.d, e.data.lastUpdate)
  }
)

const nextPointPosition = usePointPoisiton(
  toRef(props.vehicle, 'nextPoint')
)
const commandPoint = useCommandPointPosition(
  toRef(props.vehicle, 'locationPickup'),
  toRef(props.vehicle, 'locationDropoff'),
  toRef(props.vehicle, 'commandPoint')
)
const commandLineColor = computed(() => {
  if (commandPoint.type.value === 'pickup')
    return 'rgba(40, 180, 115, 0.8)'
  else if (commandPoint.type.value === 'dropoff')
    return 'rgba(65, 175, 250, 0.8)'
  else return undefined
})

function onMouseover(event: MouseEvent) {
  setHoveredVehicle(props.vehicle)
  emit('mouseoverOnObject', {
    type: 'VEHICLE',
    value: deepCopy(props.vehicle),
    event,
  })
}
function onMouseleave() {
  setHoveredVehicle(undefined)
  emit('mouseleaveOnObject')
}
function onDbClick() {
  setTrackedObject(props.vehicle)
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: 'VEHICLE',
    value: deepCopy(props.vehicle),
  })
}
function onRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'VEHICLE',
    value: deepCopy(props.vehicle),
    event,
  })
}

onUnmounted(() => {
  makeDInUpdateWorker.terminate()
})
</script>

<template>
  <!-- presentation component without logic -->
  <VehiclePresentation
    v-if="realtimePosition"
    :x="realtimePosition.x"
    :y="realtimePosition.y"
    :vid="props.vehicle.id"
    :logicalId="props.vehicle.logicalId"
    :orderId="props.vehicle.orderId"
    :type="props.vehicle.type"
    :mode="props.vehicle.mode"
    :cargoState="props.vehicle.cargoState"
    :cargoTransferResult="props.vehicle.cargoTransferResult"
    :errorList="props.vehicle.errorList"
    :isMaint="props.vehicle.isMaint"
    :isConnected="props.vehicle.isConnected"
    :isSensorStopped="props.vehicle.isSensorStopped"
    :isBlocked="props.vehicle.isBlocked"
    :groupColor="group ? getGroupColorWithAlpha(group.color) : undefined"
    :isHotlot="isHotlot"
    :isStale="isStale"
    :isPreventCall="isPreventCall"
    :isPreventPush="isPreventPush"
    :isFocused="props.vehicle.isFocused"
    :isHovered="props.vehicle.isHovered"
    @dblclick="onDbClick()"
    @leftclick="onLeftClick()"
    @rightclick="onRightClick($event)"
    @mouseover="onMouseover($event)"
    @mouseout="onMouseleave()"
    @mouseleave="onMouseleave()"
  />

  <!-- next point line -->
  <line
    v-if="
      props.vehicle.movingState === 'M' &&
      nextPointPosition &&
      realtimePosition
    "
    class="line fixed-scale-stroke"
    stroke="rgba(255, 220, 70, 0.8)"
    stroke-width="1.5"
    stroke-linecap="round"
    :x1="realtimePosition.x"
    :y1="realtimePosition.y"
    :x2="nextPointPosition.x"
    :y2="nextPointPosition.y"
  />

  <!-- pickup or dropoff line -->
  <line
    v-if="commandPoint.position.value && realtimePosition"
    class="line fixed-scale-stroke"
    :stroke="commandLineColor"
    stroke-width="1.5"
    stroke-linecap="round"
    :x1="realtimePosition.x"
    :y1="realtimePosition.y"
    :x2="commandPoint.position.value.x"
    :y2="commandPoint.position.value.y"
  />
</template>
