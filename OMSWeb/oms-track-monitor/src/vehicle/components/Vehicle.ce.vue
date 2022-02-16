<script setup lang="ts">
import { Vehicle } from '../types/Vehicle'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { findPointById, usePointPoisiton } from '../../point/points';
import { computed, inject, reactive, ref, toRef, toRefs, watch, watchEffect } from 'vue';
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

const props = defineProps<{
  vehicle: Vehicle
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const groupColor = useGroupColor('vehicle', toRef(props.vehicle, 'id'))

const
  isHotlot = computed(() => Number(props.vehicle.priority) === 99),
  isStale = computed(() => false)

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

// only for debug code
const vehicleRef = toRefs(props.vehicle)
watchEffect(() => {
  console.group("vhl")
  console.log("cargoState", vehicleRef.cargoState.value)
  console.log("movingState", vehicleRef.movingState.value)
  console.log("pickup", vehicleRef.locationPickup?.value)
  console.log("dropoff", vehicleRef.locationDropoff?.value)
  console.log("priority", vehicleRef.priority?.value)
  console.log("historytime", vehicleRef.historyChangeTime?.value)
  console.groupEnd()
})
</script>

<template>
  <symbol class="overflow-visible cursor-pointer" :id="`vehicle-${props.vehicle.id}`">
    <circle v-show="groupColor" class="group-shadow vehicle-group-shadow" :fill="groupColor" />
    <!-- vehicle mode -->
    <circle
      :class="['vehicle-mode', props.vehicle.mode === 'A' ? 'vehicle-mode-auto' : 'vehicle-mode-manual']"
    />

    <!-- inner background  -->
    <circle class="vehicle-inner-background" />

    <!-- cargo state start -->
    <!-- 1. Loading  -->
    <circle v-if="props.vehicle.cargoState === 'L'" class="vehicle-cargo-loading" />
    <!-- 2. Full  -->
    <circle v-else-if="props.vehicle.cargoState === 'F'" class="vehicle-cargo-full" />
    <!-- 3. Unloading -->
    <circle v-else-if="props.vehicle.cargoState === 'U'" class="vehicle-cargo-unloading" />
    <!-- 4. Empty -->
    <!-- Empty is Empty! -->
    <!-- 5. Load Failed -->
    <g v-else-if="props.vehicle.cargoState === 'loadfailed'" class="vehicle-cargo-loadfailed">
      <line x1="-40" y1="-40" x2="40" y2="40" />
      <line x1="-40" y1="40" x2="40" y2="-40" />
    </g>
    <!-- 6. Unload Failed -->
    <g v-else-if="props.vehicle.cargoState === 'unloadfailed'" class="vehicle-cargo-unloadfailed">
      <circle r="30" />
      <line x1="-40" y1="-40" x2="40" y2="40" />
      <line x1="-40" y1="40" x2="40" y2="-40" />
    </g>
    <!-- cargo state end -->

    <!-- <text y="70">{{ props.vehicle.logicalId }}</text> -->
    <MapReverseRotate :x="realtimePosition.x" :y="realtimePosition.y">
      <!-- vehicle id -->
      <RasterizedText class="invert" x="-150" y="-65" :text="props.vehicle.logicalId" />
      <!-- vehicle order with priority(hotlot) -->
      <g :class="{ 'vehicle-order-hotlot-border': isHotlot }">
        <text
          v-if="props.vehicle.orderId"
          :class="['invert', 'select-none', isHotlot && 'vehicle-order-hotlot']"
          x="-150"
          y="65"
        >{{ String(props.vehicle.orderId) }}</text>
      </g>

      <!-- vehicle properties ordered by priority ==== START -->

      <!-- top left (2) -->
      <!-- 1. Blocked -->
      <circle v-if="props.vehicle.isBlocked" class="vehicle-state-blocked" />
      <!-- 2. Sensor Stop -->
      <circle v-else-if="props.vehicle.isSensorStopped" class="vehicle-state-sensorstopped" />
      <template v-else></template>

      <!-- top right (1) -->
      <!-- 1. Stale -->
      <!-- where is staled -->
      <path v-if="isStale" class="vehicle-state-stale" />

      <!-- bottom left (1) -->
      <!-- 1. Error -->
      <!-- triangle with width 40 and height 30 -->
      <path v-if="props.vehicle.errorList" class="vehicle-state-error" />

      <!-- bottom right (4) -->
      <!-- 1. Disconnected -->
      <path v-if="false" class="vehicle-state-disconnected" />
      <!-- 2. Maintained -->
      <g v-else-if="true">
        <circle cx="80" cy="-80" r="15" fill="#4e9ff3" />
        <rect
          x="80"
          y="-80"
          transform="translate(5,-5) rotate(225degree)"
          width="10"
          height="15"
          fill="white"
        />
        <rect
          x="80"
          y="-80"
          transform="translate(-10, 10) rotate(45degree)"
          width="30"
          height="10"
          fill="#4e9ff3"
        />
      </g>

      <!-- <path class="123" d="M 0 0" /> -->
      <!-- 3. Prevent Call or Prevent Push -->
      <!-- where is prevent call or prevent push -->
      <g v-else-if="true" class="123">
        <circle />
        <!-- 3-A. Prevent Call -->
        <path />
        <!-- 3-B. Prevent Push -->
        <path />
      </g>
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

  <!-- <animateMotion ref="animateMotionRef" fill="freeze" dur="0.3s" :path="animateMotionPath" /> -->

  <!-- next point line -->
  <line
    class="vehicle-nextpoint-line"
    v-if="nextPointPosition"
    :x1="realtimePosition.x"
    :y1="realtimePosition.y"
    :x2="nextPointPosition.x"
    :y2="nextPointPosition.y"
  />

  <!-- pickup or dropoff line -->
  <line
    v-if="commandPoint.position.value"
    :class="['vehicle-command-line',
    commandPoint.type.value === 'pickup' ? 'vehicle-pickup-line' : commandPoint.type.value === 'dropoff' ? 'vehicle-dropoff-line' : false]"
    :x1="realtimePosition.x"
    :y1="realtimePosition.y"
    :x2="commandPoint.position.value.x"
    :y2="commandPoint.position.value.y"
  />
</template>