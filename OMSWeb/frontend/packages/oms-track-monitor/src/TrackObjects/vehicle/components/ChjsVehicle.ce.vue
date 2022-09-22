<script setup lang="ts">
import { computed, inject, ref, toRef, watch } from 'vue'
import { Vehicle, ComplicatedMode } from '../types/Vehicle'
import { getVehiclePosition } from '../vehicles'
import { findPointById } from '../../point/points'
import { findSegmentByPoints } from '../../segment/segments'
import { Segment } from '../../segment/types/Segment'
import { useGroup } from '../../group/groups'
import {
  useNextPointPosition,
  useCommandPointPosition,
  useHomeIvrPointPosition
} from '../utils/lines'
import { RootEmitInjectionKey, RootEmits } from 'src/Root/types/RootEmits'
import { createPathElement, getPositionFromD } from 'src/utils/svg/path'
import { D } from 'src/types/D'
import { deepCopy } from 'src/utils/deepCopy'
import { Position } from 'src/types/Position'
import ChjsVehiclePresentation from './ChjsVehiclePresentation.ce.vue'
import { moveCamera } from 'src/MapObjects/map/camera'
import { setHoveredVehicle } from '../hoveredVehicle'
import { setTrackedObject } from 'src/MapObjects/track/track'
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'
import { getRotatedPosition } from 'src/MapObjects/cameraAndRotation'
import { makeVehicleAnimationPath } from '../utils/vehilcleAnimationPath'

const props = defineProps<{
  vehicle: Vehicle
}>()
const vehicle = toRef(props, 'vehicle')
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const group = useGroup('vehicle', toRef(props.vehicle, 'id'))

const complicatedMode = computed<ComplicatedMode>(() => {
  if (props.vehicle.isConnected !== true)
    return 'DISCONNECT'
  if (props.vehicle.errorList)
    return 'ERROR'
  if (props.vehicle.isMaint)
    return 'MAINTENANCE'
  if (props.vehicle.mode === 'M')
    return 'MANUAL'
  if (props.vehicle.isSensorStopped)
    return 'SENSORSTOPPED'
  if (props.vehicle.isZcuBlocked)
    return 'ZCUBLOCKED'

  const isAnyLocationExist = !!(props.vehicle.locationPickup || props.vehicle.locationDropoff || props.vehicle.locationMove)
  const destPointId = Number.isInteger(Number(props.vehicle.destPoint)) ? Number(props.vehicle.destPoint) : undefined

  if (isAnyLocationExist)
    return 'RUNNING'
  if (isAnyLocationExist === false && destPointId && props.vehicle.curPoint !== destPointId && props.vehicle.movingState === 'M')
    return 'HOMEIVR'
  // if (isAnyLocationExist === false && destPointId && props.vehicle.curPoint === destPointId)
    return 'IDLE'
  
  // return undefined
})

const isHotlot = computed(() => Number(props.vehicle.priority) === 99),
  isTransferDisabled = computed(() => {
    const originInUpper = (
      typeof props.vehicle.orderOrigin === 'string'
        ? props.vehicle.orderOrigin
        : (props.vehicle.orderOrigin ?? []).join('')
    ).toUpperCase()

    const hasMCS = originInUpper.includes('MCS')
    const hasAsterisk = originInUpper.includes('*')

    return hasMCS === false && hasAsterisk === false
  }),
  isPushDisabled = computed(() => props.vehicle.canBePushed === false)

const currentPosition = ref<Position | undefined>(
  getVehiclePosition(props.vehicle)
),
  currentSegment = ref<Segment>()

const beforePosition = ref<Position>(),
  beforeSegment = ref<Segment>()

const realtimePosition = ref<Position | undefined>(
  currentPosition.value ?? undefined
)

watch(
  () => vehicle.value.lastUpdated,
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

    if (
      (props.vehicle.updateType === 'AnimationIn1Segment' ||
        props.vehicle.updateType === 'AnimationIn2Segments') &&
      currentSegment.value &&
      beforeSegment.value &&
      currentPosition.value &&
      beforePosition.value
    ) {
      const d = makeVehicleAnimationPath(
        props.vehicle.updateType,
        beforeSegment.value,
        currentSegment.value,
        beforePosition.value,
        currentPosition.value
      )

      trackVehiclePosition(d, props.vehicle.lastUpdated)
    } else {
      realtimePosition.value = newPosition
    }
  }
)

// time with microsecond
// animation duration 0.3s with linear
const TotalVehicleAnimationDuration = 300
function trackVehiclePosition(d: D, lastUpdated?: number) {
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
      globalThis.requestAnimationFrame(() => { })
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

const nextPointPosition = useNextPointPosition(vehicle)
const commandPoint = useCommandPointPosition(vehicle)
const commandLineColor = computed(() => {
  switch (commandPoint.type.value) { 
    case 'pickup': // in chjs `From Moving`
      return '#87CEEB'
    case 'dropoff': // in chjs `To Moving`
      return '#FFCCFF'
    case 'move': // in chjs `Moving`
      return '#F4DD65'
    default:
      return undefined
  }
})
const homeIvrPoint = useHomeIvrPointPosition(vehicle)

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
</script>

<template>
  <!-- presentation component without logic -->
  <ChjsVehiclePresentation v-if="realtimePosition" :x="realtimePosition.x" :y="realtimePosition.y"
    :vid="props.vehicle.id" :logicalId="props.vehicle.logicalId" :orderId="props.vehicle.orderId"
    :type="props.vehicle.type" :mode="props.vehicle.mode" :complicatedMode="complicatedMode"
    :cargoState="props.vehicle.cargoState" :cargoTransferResult="props.vehicle.cargoTransferResult"
    :carrierId="props.vehicle.carrierId" :errorList="props.vehicle.errorList" :isMaint="props.vehicle.isMaint"
    :isConnected="props.vehicle.isConnected" :isSensorStopped="props.vehicle.isSensorStopped"
    :isZcuBlocked="props.vehicle.isZcuBlocked" :isBlocked="props.vehicle.isBlocked"
    :groupColor="group ? getGroupColorWithAlpha(group.color) : undefined" :isHotlot="isHotlot"
    :isTransferDisabled="isTransferDisabled" :isPushDisabled="isPushDisabled" :isFocused="props.vehicle.isFocused"
    :isHovered="props.vehicle.isHovered" @dblclick="onDbClick()" @leftclick="onLeftClick()"
    @rightclick="onRightClick($event)" @mouseover="onMouseover($event)" @mouseout="onMouseleave()"
    @mouseleave="onMouseleave()" />

  <template v-if="props.vehicle.isConnected">
  <!-- next point line -->
    <line   
      v-if="props.vehicle.movingState === 'M' && nextPointPosition && realtimePosition" 
      class="line next-line fixed-scale-stroke" 
      stroke="#91e079" 
      stroke-width="1" 
      stroke-linecap="round" 
      shape-rendering="auto"
      :x1="realtimePosition.x" 
      :y1="realtimePosition.y" 
      :x2="nextPointPosition.x" 
      :y2="nextPointPosition.y" 
    />

    <!-- pickup or dropoff or move line -->
    <line 
      v-if="commandPoint.position.value && realtimePosition" 
      :class="{
        'line': true,
        'from-line': commandPoint.type.value === 'pickup',
        'to-line': commandPoint.type.value === 'dropoff',
        'move-line': commandPoint.type.value === 'move',
        'fixed-scale-stroke': true
      }"
      :stroke="commandLineColor" 
      stroke-width="1" 
      stroke-linecap="round" 
      shape-rendering="auto" 
      :x1="realtimePosition.x"
      :y1="realtimePosition.y" 
      :x2="commandPoint.position.value.x" 
      :y2="commandPoint.position.value.y" 
    />

    <!-- home/ivr line -->
    <line 
      v-else-if="props.vehicle.movingState === 'M' && homeIvrPoint && realtimePosition" 
      class="line homeivr-line fixed-scale-stroke"
      stroke="#ffa500" 
      stroke-width="1" 
      stroke-linecap="round" 
      shape-rendering="auto" 
      :x1="realtimePosition.x"
      :y1="realtimePosition.y" 
      :x2="homeIvrPoint.x" 
      :y2="homeIvrPoint.y" 
    />
  </template>
</template>
