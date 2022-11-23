<script setup lang="ts">
import { ComplicatedMode, Vehicle } from '../types/Vehicle'
import { readonlyVehicleSecondaryContent } from '../vehicleSecondaryContent'
// svg component
import VehicleStateMaintainedSvg from '../assets/VehicleStateMaintained.svg?component'
import VehicleStatePushDisabledSvg from '../assets/VehicleStatePushDisabled.svg?component'
import VehicleStateTransferDisabledSvg from '../assets/VehicleStateTransferDisabled.svg?component'
import VehicleTypeNormal from '../assets/VehicleTypeNormal.svg?component'
import VehicleCargoLoadingSvg from '../assets/VehicleCargoLoading.svg?component'
import VehicleCargoUnloadingSvg from '../assets/VehicleCargoUnloading.svg?component'
import VehicleCargoFullSvg from '../assets/VehicleCargoFull.svg?component'
import VehicleCargoTransferFailSvg from '../assets/VehicleCargoTransferFail.svg?component'
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
  carrierId: Vehicle['carrierId']
  errorList: Vehicle['errorList']
  isMaint: Vehicle['isMaint']
  isConnected: Vehicle['isConnected']
  isSensorStopped: Vehicle['isSensorStopped']
  isZcuBlocked: Vehicle['isZcuBlocked']
  isBlocked: Vehicle['isBlocked']

  // Derived attr
  groupColor?: string
  isHotlot: boolean
  isSuperHotlot: boolean
  isTransferDisabled: boolean // before isPreventCall
  isPushDisabled: boolean // before isPreventPush
  complicatedMode: ComplicatedMode // new in chjs

  // TM attr,
  isFocused?: boolean
  isCarrierFocused?: boolean
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
  <svg class="overflow-visible cursor-pointer vehicle-symbol" :data-mode="props.mode"
    :data-complicated-mode="props.complicatedMode" :data-carrier-focused="props.isCarrierFocused">
    <g class="scale-and-reverse-rotate">
      <circle v-show="groupColor" class="group-shadow" r="25" :fill="groupColor" />

      <!-- using discrete svg element to overlap effects -->
      <VehicleTypeNormalOutline v-if="props.isFocused" class="type focus" width="40" height="40" x="-20" y="-20" />
      <VehicleTypeNormalOutline v-if="props.isHovered" class="type hover" width="40" height="40" x="-20" y="-20" />
      <VehicleTypeNormal width="40" height="40" x="-20" y="-20" @dblclick="emit('dblclick')"
        @click.left="emit('leftclick')" @click.right="emit('rightclick', $event)" @mouseover="emit('mouseover', $event)"
        @mouseout="emit('mouseout')" @mouseleave="emit('mouseleave')" />

      <VehicleFocusArrow v-if="props.isHovered || props.isFocused" :class="[
        'arrow',
        props.isHovered && 'hover',
        props.isFocused && 'focus',
      ]" width="40" height="40" x="20" y="20" />

      <!-- vehicle type && vehicle mode end -->

      <!-- cargo state start -->
      <!-- 1. Loading  -->
      <VehicleCargoLoadingSvg v-if="props.cargoState === 'L'" width="15" height="15" x="-7.5" y="-7.5" />
      <!-- 2. Full  -->
      <VehicleCargoFullSvg v-else-if="props.cargoState === 'F'" width="15" height="15" x="-7.5" y="-7.5" />
      <!-- 3. Unloading -->
      <VehicleCargoUnloadingSvg v-else-if="props.cargoState === 'U'" width="15" height="15" x="-7.5" y="-7.5" />
      <!-- 4. Empty: Empty is Empty! -->
      <template v-else />
      <!-- 5. Load/Unload Failed -->
      <VehicleCargoTransferFailSvg v-if="props.cargoTransferResult" width="20" height="20" x="-10" y="-10" />
      <!-- cargo state end -->

      <!-- Text fields START -->
      <!-- https://stackoverflow.com/questions/442164/how-to-get-an-outline-effect-on-text-in-svg -->
      <!-- vehicle id -->
      <!-- 📐🛑 Be careful! logic is dependent on invert -->

      <!-- font-weight="bold" -->
      <text class="select-none" text-rendering="optimizeSpeed" transform="scale(1 -1) translate(-25 -2)"
        text-anchor="end" alignment-baseline="baseline" font-size="0.8em" stroke="white" stroke-width="1px" fill="black"
        paint-order="stroke">
        {{ props.logicalId }}
      </text>
      <!-- vehicle order with priority(hotlot) -->
      <g :filter="
        isHotlot ? `url(#vehicle-order-hotlot-border)` : undefined
      ">

        <!-- A: OrderId -->
        <!-- 📐🛑 Be careful! logic is dependent on invert -->
        <text v-if="readonlyVehicleSecondaryContent === 'order' && props.orderId" class="select-none"
          text-rendering="optimizeSpeed" transform="scale(1 -1) translate(-25 2)" text-anchor="end"
          alignment-baseline="hanging" :filter="
            props.isHotlot
              ? `url(#vehicle-order-hotlot-background)`
              : undefined
          ">
          <template v-if="props.isSuperHotlot">
            ★
          </template>
          {{ props.orderId }}
        </text>

        <!-- B: CarrierId -->
        <!-- 📐🛑 Be careful! logic is dependent on invert -->
        <text v-if="readonlyVehicleSecondaryContent === 'carrier' && props.carrierId" class="select-none"
          text-rendering="optimizeSpeed" font-size="small" transform="scale(1 -1) translate(-25 2)" text-anchor="end"
          alignment-baseline="hanging" :filter="
            props.isHotlot
              ? `url(#vehicle-order-hotlot-background)`
              : undefined
          ">
          {{ props.carrierId }}
        </text>
      </g>
      <!-- Text fields END -->

      <!-- vehicle properties ordered by priority ==== START -->

      <!-- top left (0) -->
      <!-- nothing -->

      <!-- top right (1) -->
      <!-- 1. Sensor Stop -->
      <text v-if="props.isSensorStopped" class="select-none" x="20" y="12" font-weight="bold"
        style="transform: rotate(180deg) scaleX(-1); transform-origin: 20px 12px;">
        S
      </text>

      <!-- 2. Zcu Blocked -->
      <text v-else-if="props.isZcuBlocked" class="select-none" x="20" y="12" font-weight="bold"
        style="transform: rotate(180deg) scaleX(-1); transform-origin: 20px 12px;">
        Z
      </text>
      <template v-else />

      <!-- bottom left (0) -->
      <!-- nothing -->

      <!-- bottom right (3) -->
      <!-- 1. Maintained -->
      <VehicleStateMaintainedSvg v-if="props.complicatedMode === 'MAINTENANCE'" x="22" y="-18" width="20" height="20" />
      <!-- 2. Prevent Call or Prevent Push -->
      <template v-else-if="props.isTransferDisabled || props.isPushDisabled">
        <!-- 2-A. Prevent Push -->
        <VehicleStatePushDisabledSvg v-if="props.isPushDisabled" width="15" height="15" x="22" y="-18" />
        <!-- 2-B. Prevent Call -->
        <VehicleStateTransferDisabledSvg v-if="props.isTransferDisabled" width="15" height="15"
          :x="props.isPushDisabled ? 40 : 22" y="-18" />
      </template>
      <template v-else />

      <!-- vehicle properties ordered by priority ==== END -->
    </g>
  </svg>
</template>
