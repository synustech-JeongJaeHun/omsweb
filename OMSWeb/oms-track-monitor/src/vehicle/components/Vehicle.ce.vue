<script setup lang="ts">
import { computed, inject, reactive, ref, toRef, watch } from 'vue';
import { Vehicle } from '../types/Vehicle'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { findPointById, usePointPoisiton } from '../../point/points';
import { findSegmentByPoints } from '../../segment/segments';
import { createPathElement, getPositionFromD } from '../../utils/svg/path';
import { Segment } from '../../segment/types/Segment';
import { encodeCommandsToD, moveTo, slicePathCommands } from '../../utils/svg/pathSegment';
import { useGroupColor } from '../../group/groups';
import { D } from '../../types/D';
import MapReverseRotate from '../../rotate/components/MapReverseRotate.ce.vue';
import { useCommandPointPosition } from '../utils/lines';
import { RootEmitInjectionKey, RootEmits } from '../../types/RootEmits';
import { deepCopy } from '../../utils/deepCopy';

import VehicleStateMaintainedSvg from '../assets/VehicleStateMaintainedSvg.ce.vue'
import VehicleStatePreventPushSvg from '../assets/VehicleStatePreventPushSvg.ce.vue'
import VehicleStatePreventCallSvg from '../assets/VehicleStatePreventCallSvg.ce.vue'

const props = defineProps<{
  vehicle: Vehicle
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const groupColor = useGroupColor('vehicle', toRef(props.vehicle, 'id'))

const
  isHotlot = computed(() => Number(props.vehicle.priority) === 99),
  isStale = computed(() => {
    // TODO: stale 상태는 db에서 받아올 수 있을 때 작업을 시작하도록 하자
    return false
  }),
  isPreventCall = computed(() => {
    if (props.vehicle.orderOrigin) {
      if (typeof props.vehicle.orderOrigin === 'string')
        return props.vehicle.orderOrigin.trim().length === 0
      else
        return props.vehicle.orderOrigin.length === 0
    }
    else
      return true
  }),
  isPreventPush = computed(() => props.vehicle.canBePushed === false),
  vehicleModeColor = computed(() => {
    if (props.vehicle.mode === 'A') return 'gray'
    else if (props.vehicle.mode === 'M') return 'green'
    else return 'transparent'
  })

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

const nextPointPosition = usePointPoisiton(toRef(props.vehicle, 'nextPoint'))
const commandPoint = useCommandPointPosition(
  toRef(props.vehicle, 'locationPickup'),
  toRef(props.vehicle, 'locationDropoff'),
  toRef(props.vehicle, 'commandPoint')
)
const commandLineColor = computed(() => {
  if (commandPoint.type.value === 'pickup') return 'rgb(40, 180, 115)'
  else if (commandPoint.type.value === 'dropoff') return 'rgb(65, 175, 250)'
  else return undefined
})


// const test = 120
// const threshold = 80

// const outerR = computed(() => {
//   const calculated = test / scaleInfo.value.pixelPerMm
//   return calculated < threshold ? threshold : calculated
// })
// const innerR = computed(() => outerR.value / 8 * 5)

function onTooltipOn() {
  emit('tooltipon', {
    type: 'Vehicle',
    value: deepCopy(props.vehicle)
  })
}
function onTooltipOff() {
  emit('tooltipoff')
}
function onFocus() {
  emit('focus', {
    type: "Vehicle",
    value: deepCopy(props.vehicle)
  })
}
function onContextmenu() {
  emit('contextmenuon', {
    type: "Vehicle",
    value: deepCopy(props.vehicle)
  })
}
</script>

<template>
  <symbol class="overflow-visible cursor-pointer" :id="`vehicle-${props.vehicle.id}`">
    <circle v-show="groupColor" class="group-shadow" r="120" :fill="groupColor" />

    <!-- vehicle type && vehicle mode start -->
    <path
      v-if="props.vehicle.type === 'CLEANING'"
      stroke="rgb(65,65,65)"
      stroke-width="4"
      :fill="vehicleModeColor"
      d="
      M 0 80
      L -80 0
      L 0 -80
      L 80 0
      Z
      "
    />
    <path
      v-else
      stroke="black"
      stroke-width="3"
      :fill="vehicleModeColor"
      d="
      M 0 -80
      A 80 80 0 1 0 0 80
      A 80 80 0 1 0 0 -80 
      Z
      M 0 -50
      A 50 50 0 1 1 0 50
      A 50 50 0 1 1 0 -50 
      Z"
    />
    <!-- vehicle type && vehicle mode end -->

    <!-- cargo state start -->
    <!-- 1. Loading  -->
    <circle v-if="props.vehicle.cargoState === 'L'" fill="rgb(0, 0, 205)">
      <animate attributeName="r" values="0;40" dur="1s" repeatCount="indefinite" />
    </circle>
    <!-- 2. Full  -->
    <circle v-else-if="props.vehicle.cargoState === 'F'" r="40" fill="rgb(50,50,50)" />
    <!-- 3. Unloading -->
    <circle v-else-if="props.vehicle.cargoState === 'U'">
      <animate attributeName="r" values="40;0" dur="1s" repeatCount="indefinite" />
    </circle>
    <template v-else />
    <!-- 4. Empty -->
    <!-- Empty is Empty! -->
    <!-- 5. Load/Unload Failed -->
    <path
      v-if="props.vehicle.cargoTransferResult"
      stroke="orange"
      stroke-width="4"
      d="
    M -32 -32
    L 32 32
    M -32 32
    L 32 -32"
    />
    <!-- cargo state end -->

    <!-- <text y="70">{{ props.vehicle.logicalId }}</text> -->
    <MapReverseRotate :x="realtimePosition.x" :y="realtimePosition.y">
      <!-- vehicle id -->
      <RasterizedText class="invert" x="-150" y="-65" :text="props.vehicle.logicalId" />
      <!-- vehicle order with priority(hotlot) -->
      <g :filter="isHotlot ? `url(#vehicle-order-hotlot-border)` : undefined">
        <text
          v-if="props.vehicle.orderId"
          class="invert select-none"
          :filter="isHotlot ? `url(#vehicle-order-hotlot-background)` : undefined"
          x="-150"
          y="65"
        >{{ String(props.vehicle.orderId) }}</text>
      </g>

      <!-- vehicle properties ordered by priority ==== START -->

      <!-- top left (2) -->
      <!-- 1. Blocked -->
      <circle v-if="props.vehicle.isBlocked" cx="-80" cy="80" r="20" fill="red" />
      <!-- 2. Sensor Stop -->
      <circle
        v-else-if="props.vehicle.isSensorStopped"
        cx="-80"
        cy="80"
        r="15"
        stroke="rgb(255, 90, 90)"
        stroke-width="5"
        fill="rgb(255, 192, 203)"
      />
      <template v-else></template>

      <!-- top right (1) -->
      <!-- 1. Stale -->
      <!-- where is staled -->
      <path
        v-if="isStale"
        fill="none"
        stroke="black"
        stroke-width="2"
        d="
      M 80 80 
      m -15 0 
      a 15 15 0 1 0 30 0 
      a 15 15 0 1 0 -30 0 
      M 80 90 
      L 80 80 
      L 70 80
      "
      />

      <!-- bottom left (1) -->
      <!-- 1. Error -->
      <!-- triangle with width 40 and height 30 -->
      <path
        v-if="props.vehicle.errorList"
        fill="yellow"
        stroke="orange"
        stroke-width="5"
        d="
      M -80 -65 
      L -100 -95 
      L -60 -95 
      Z"
      />

      <!-- bottom right (4) -->
      <!-- 1. Disconnected -->
      <path
        v-if="props.vehicle.isConnected === false"
        stroke="red"
        stroke-width="3"
        fill="none"
        d="
      M 80 -70 
      L 90 -60 
      L 90 -85 
      M 90 -90 
      L 60 -90 
      L 75 -75 
      M 60 -60 
      L 95 -95
      "
      />
      <!-- 2. Maintained -->
      <VehicleStateMaintainedSvg
        v-else-if="props.vehicle.isMaint"
        width="50"
        height="50"
        x="80"
        y="-80"
      />
      <!-- 3. Prevent Call or Prevent Push -->
      <template v-else-if="isPreventCall || isPreventPush">
        <!-- 3-A. Prevent Call -->
        <VehicleStatePreventCallSvg v-if="isPreventCall" width="50" height="50" x="80" y="-80" />
        <!-- 3-B. Prevent Push -->
        <VehicleStatePreventPushSvg v-if="isPreventPush" width="50" height="50" x="80" y="-80" />
      </template>
      <template v-else />

      <!-- vehicle properties ordered by priority ==== END -->
    </MapReverseRotate>
  </symbol>

  <use
    :href="`#vehicle-${props.vehicle.id}`"
    :x="realtimePosition.x"
    :y="realtimePosition.y"
    @click.left="onFocus()"
    @click.right="onContextmenu()"
    @mouseover="onTooltipOn()"
    @mouseout="onTooltipOff()"
    @mouseleave="onTooltipOff()"
  />

  <!-- next point line -->
  <line
    v-if="nextPointPosition"
    class="line"
    stroke="rgb(255, 220, 70)"
    stroke-width="40"
    stroke-linecap="round"
    :x1="realtimePosition.x"
    :y1="realtimePosition.y"
    :x2="nextPointPosition.x"
    :y2="nextPointPosition.y"
  />

  <!-- pickup or dropoff line -->
  <line
    v-if="commandPoint.position.value"
    class="line"
    :stroke="commandLineColor"
    stroke-width="40"
    stroke-linecap="round"
    :x1="realtimePosition.x"
    :y1="realtimePosition.y"
    :x2="commandPoint.position.value.x"
    :y2="commandPoint.position.value.y"
  />
</template>