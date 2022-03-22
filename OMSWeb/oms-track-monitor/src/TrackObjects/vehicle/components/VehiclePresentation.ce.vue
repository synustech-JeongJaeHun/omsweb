<script setup lang="ts">
import { Vehicle } from '../types/Vehicle'
// svg component
import VehicleStateMaintainedSvg from '../assets/VehicleStateMaintained.svg?component'
import VehicleStatePreventPushSvg from '../assets/VehicleStatePreventPush.svg?component'
import VehicleStatePreventCallSvg from '../assets/VehicleStatePreventCall.svg?component'
import VehicleTypeNormal from '../assets/VehicleTypeNormal.svg?component'
import VehicleTypeCleaning from '../assets/VehicleTypeCleaning.svg?component'
import VehicleCargoLoadingSvg from '../assets/VehicleCargoLoading.svg?component'
import VehicleCargoUnloadingSvg from '../assets/VehicleCargoUnloading.svg?component'
import VehicleCargoFullSvg from '../assets/VehicleCargoFull.svg?component'
import VehicleCargoTransferFailSvg from '../assets/VehicleCargoTransferFail.svg?component'
import VehicleStateBlockSvg from '../assets/VehicleStateBlock.svg?component'
import VehicleStateSensorStopSvg from '../assets/VehicleStateSensorStop.svg?component'
import VehicleStateStaleSvg from '../assets/VehicleStateStale.svg?component'
import VehicleStateErrorSvg from '../assets/VehicleStateError.svg?component'
import VehicleStateDisconnectedSvg from '../assets/VehicleStateDisconnected.svg?component'
import VehicleTypeCleaningOutline from '../assets/VehicleTypeCleaningOutline.svg?component'
import VehicleTypeNormalOutline from '../assets/VehicleTypeNormalOutline.svg?component'
import VehicleFocusArrow from '../assets/VehicleFocusArrow.svg?component'

const props = defineProps<{
  // Vehicle attr
  // vid for avoid keyword conflict with vue
  vid: Vehicle['id']
  logicalId: Vehicle['logicalId']
  orderId: Vehicle['orderId']
  type: Vehicle['type']
  mode: Vehicle['mode']
  cargoState: Vehicle['cargoState']
  cargoTransferResult: Vehicle['cargoTransferResult']
  errorList: Vehicle['errorList']
  isMaint: Vehicle['isMaint']
  isConnected: Vehicle['isConnected']
  isSensorStopped: Vehicle['isSensorStopped']
  isBlocked: Vehicle['isBlocked']

  // Derived attr
  groupColor?: string
  isHotlot: boolean
  isStale: boolean
  isPreventCall: boolean
  isPreventPush: boolean

  // TM attr,
  isFocused?: boolean
  isHovered?: boolean
}>()

const emit = defineEmits<{
  (event: 'dblclick'): void
  (event: 'leftclick'): void
  (event: 'rightclick', mouseEvent: MouseEvent): void
  (event: 'mouseover', mouseEvent: MouseEvent): void
  (event: 'mouseout'): void
  (event: 'mouseleave'): void
}>()
</script>

<template>
  <!-- 
    Vehicle Outer Standard Size
    w 40 h 40 r 20

    Vehicle Cargo Standard Size
    w 20 h 20 r 10

    Group Circle size
    w 50 h 50 r 25
  -->
  <svg
    class="overflow-visible cursor-pointer vehicle-symbol"
    :data-mode="props.mode"
  >
    <g class="scale-and-reverse-rotate">
      <circle
        v-show="groupColor"
        class="group-shadow"
        r="25"
        :fill="groupColor"
      />

      <!-- vehicle type && vehicle mode start -->
      <template v-if="props.type === 'CLEANING'">
        <!-- using discrete svg element to overlap effects -->
        <VehicleTypeCleaningOutline
          v-if="props.isFocused"
          class="type focus"
          width="40"
          height="40"
          x="-20"
          y="-20"
        />
        <VehicleTypeCleaningOutline
          v-if="props.isHovered"
          class="type hover"
          width="40"
          height="40"
          x="-20"
          y="-20"
        />
        <VehicleTypeCleaning
          width="40"
          height="40"
          x="-20"
          y="-20"
          @dblclick="emit('dblclick')"
          @click.left="emit('leftclick')"
          @click.right="emit('rightclick', $event)"
          @mouseover="emit('mouseover', $event)"
          @mouseout="emit('mouseout')"
          @mouseleave="emit('mouseleave')"
        />
      </template>

      <template v-else>
        <!-- using discrete svg element to overlap effects -->
        <VehicleTypeNormalOutline
          v-if="props.isFocused"
          class="type focus"
          width="40"
          height="40"
          x="-20"
          y="-20"
        />
        <VehicleTypeNormalOutline
          v-if="props.isHovered"
          class="type hover"
          width="40"
          height="40"
          x="-20"
          y="-20"
        />
        <VehicleTypeNormal
          width="40"
          height="40"
          x="-20"
          y="-20"
          @dblclick="emit('dblclick')"
          @click.left="emit('leftclick')"
          @click.right="emit('rightclick', $event)"
          @mouseover="emit('mouseover', $event)"
          @mouseout="emit('mouseout')"
          @mouseleave="emit('mouseleave')"
        />
      </template>

      <VehicleFocusArrow
        v-if="props.isHovered || props.isFocused"
        :class="[
          'arrow',
          props.isHovered && 'hover',
          props.isFocused && 'focus',
        ]"
        width="40"
        height="40"
        x="20"
        y="20"
      />

      <!-- vehicle type && vehicle mode end -->

      <!-- cargo state start -->
      <!-- 1. Loading  -->
      <VehicleCargoLoadingSvg
        v-if="props.cargoState === 'L'"
        width="15"
        height="15"
        x="-7.5"
        y="-7.5"
      />
      <!-- 2. Full  -->
      <VehicleCargoFullSvg
        v-else-if="props.cargoState === 'F'"
        width="15"
        height="15"
        x="-7.5"
        y="-7.5"
      />
      <!-- 3. Unloading -->
      <VehicleCargoUnloadingSvg
        v-else-if="props.cargoState === 'U'"
        width="15"
        height="15"
        x="-7.5"
        y="-7.5"
      />
      <!-- 4. Empty: Empty is Empty! -->
      <template v-else />
      <!-- 5. Load/Unload Failed -->
      <VehicleCargoTransferFailSvg
        v-if="props.cargoTransferResult"
        width="20"
        height="20"
        x="-10"
        y="-10"
      />
      <!-- cargo state end -->

      <!-- Text fields START -->
      <!-- https://stackoverflow.com/questions/442164/how-to-get-an-outline-effect-on-text-in-svg -->
      <!-- vehicle id -->
      <!-- 📐🛑 Be careful! logic is dependent on invert -->

      <!-- font-weight="bold" -->
      <text
        class="select-none"
        text-rendering="optimizeSpeed"
        transform="scale(1 -1) translate(-25 -2)"
        text-anchor="end"
        alignment-baseline="baseline"
        font-size="0.8em"
        stroke="white"
        stroke-width="1px"
        fill="black"
        paint-order="stroke"
      >
        {{ props.logicalId }}
      </text>
      <!-- vehicle order with priority(hotlot) -->
      <g
        :filter="
          isHotlot ? `url(#vehicle-order-hotlot-border)` : undefined
        "
      >
        <!-- 📐🛑 Be careful! logic is dependent on invert -->
        <text
          v-if="props.orderId"
          class="select-none"
          text-rendering="optimizeSpeed"
          transform="scale(1 -1) translate(-25 2)"
          text-anchor="end"
          alignment-baseline="hanging"
          :filter="
            props.isHotlot
              ? `url(#vehicle-order-hotlot-background)`
              : undefined
          "
        >
          {{ props.orderId }}
        </text>
      </g>
      <!-- Text fields END -->

      <!-- vehicle properties ordered by priority ==== START -->

      <!-- top left (2) -->
      <!-- 1. Blocked -->
      <VehicleStateBlockSvg
        v-if="props.isBlocked"
        x="-25"
        y="15"
        width="10"
        height="10"
      />
      <!-- 2. Sensor Stop -->
      <VehicleStateSensorStopSvg
        v-else-if="props.isSensorStopped"
        x="-25"
        y="15"
        width="10"
        height="10"
      />
      <template v-else />

      <!-- top right (1) -->
      <!-- 1. Stale -->
      <!-- where is staled -->
      <VehicleStateStaleSvg
        v-if="props.isStale"
        x="15"
        y="15"
        width="10"
        height="10"
      />

      <!-- bottom left (1) -->
      <!-- 1. Error -->
      <!-- triangle with width 40 and height 30 -->
      <VehicleStateErrorSvg
        v-if="props.errorList"
        x="-20"
        y="-15"
        width="20"
        height="15"
      />

      <!-- bottom right (4) -->
      <!-- 1. Disconnected -->
      <VehicleStateDisconnectedSvg
        v-if="props.isConnected === false"
        x="22"
        y="-18"
        width="15"
        height="15"
      />
      <!-- 2. Maintained -->
      <VehicleStateMaintainedSvg
        v-else-if="props.isMaint"
        x="22"
        y="-18"
        width="20"
        height="20"
      />
      <!-- 3. Prevent Call or Prevent Push -->
      <template v-else-if="props.isPreventCall || props.isPreventPush">
        <!-- 3-A. Prevent Push -->
        <VehicleStatePreventPushSvg
          v-if="props.isPreventPush"
          width="15"
          height="15"
          x="22"
          y="-18"
        />
        <!-- 3-B. Prevent Call -->
        <VehicleStatePreventCallSvg
          v-if="props.isPreventCall"
          width="15"
          height="15"
          :x="props.isPreventPush ? 40 : 22"
          y="-18"
        />
      </template>
      <template v-else />

      <!-- vehicle properties ordered by priority ==== END -->
    </g>
  </svg>
</template>
