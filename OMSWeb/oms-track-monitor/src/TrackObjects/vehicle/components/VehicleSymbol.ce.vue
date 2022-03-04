<script setup lang="ts">
import ScaleByScale from 'src/MapObjects/scale/component/ScaleByScale.ce.vue';
import MapReverseRotate from 'src/MapObjects/rotate/components/MapReverseRotate.ce.vue';
import { Vehicle } from '../types/Vehicle';
import { getSvgTranformsInString } from 'src/utils/svg/transform'
// svg component
import VehicleStateMaintainedSvg from '../assets/VehicleStateMaintained.svg?component'
import VehicleStatePreventPushSvg from '../assets/VehicleStatePreventPush.svg?component'
import VehicleStatePreventCallSvg from '../assets/VehicleStatePreventCall.svg?component'
import RasterizedText from 'src/MapObjects/map/components/RasterizedText.ce.vue';
import VehicleTypeNormal from '../assets/VehicleTypeNormal.svg?component';
import VehicleTypeCleaning from '../assets/VehicleTypeCleaning.svg?component';
import VehicleCargoLoadingSvg from '../assets/VehicleCargoLoading.svg?component';
import VehicleCargoUnloadingSvg from '../assets/VehicleCargoUnloading.svg?component';
import VehicleCargoFullSvg from '../assets/VehicleCargoFull.svg?component';
import VehicleCargoTransferFailSvg from '../assets/VehicleCargoTransferFail.svg?component';
import VehicleStateBlockSvg from '../assets/VehicleStateBlock.svg?component';
import VehicleStateSensorStopSvg from '../assets/VehicleStateSensorStop.svg?component';
import VehicleStateStaleSvg from '../assets/VehicleStateStale.svg?component';
import VehicleStateErrorSvg from '../assets/VehicleStateError.svg?component';
import VehicleStateDisconnectedSvg from '../assets/VehicleStateDisconnected.svg?component'

const props = defineProps<{
  symbolId: string,
  // Vehicle attr
  // vid for avoid keyword conflict with vue
  vid: Vehicle['id'],
  logicalId: Vehicle['logicalId'],
  orderId: Vehicle['orderId'],
  type: Vehicle['type'],
  mode: Vehicle['mode'],
  cargoState: Vehicle['cargoState'],
  cargoTransferResult: Vehicle['cargoTransferResult'],
  errorList: Vehicle['errorList'],
  isMaint: Vehicle['isMaint'],
  isConnected: Vehicle['isConnected'],
  isSensorStopped: Vehicle['isSensorStopped'],
  isBlocked: Vehicle['isBlocked'],

  // Derived attr
  groupColor?: string,
  isHotlot: boolean,
  isStale: boolean,
  isPreventCall: boolean,
  isPreventPush: boolean,
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
  <symbol
    class="overflow-visible cursor-pointer vehicle-symbol"
    :id="props.symbolId"
    :data-mode="props.mode"
  >
    <ScaleByScale>
      <MapReverseRotate>
        <circle v-show="groupColor" class="group-shadow" r="25" :fill="groupColor" />

        <!-- vehicle type && vehicle mode start -->
        <VehicleTypeCleaning
          v-if="props.type === 'CLEANING'"
          width="40"
          height="40"
          x="-20"
          y="-20"
        />
        <VehicleTypeNormal v-else width="40" height="40" x="-20" y="-20" />
        <!-- vehicle type && vehicle mode end -->

        <!-- cargo state start -->
        <!-- 1. Loading  -->
        <VehicleCargoLoadingSvg
          v-if="props.cargoState === 'L'"
          width="20"
          height="20"
          x="-10"
          y="-10"
        />
        <!-- 2. Full  -->
        <VehicleCargoFullSvg
          v-else-if="props.cargoState === 'F'"
          width="20"
          height="20"
          x="-10"
          y="-10"
        />
        <!-- 3. Unloading -->
        <VehicleCargoUnloadingSvg
          v-else-if="props.cargoState === 'U'"
          width="20"
          height="20"
          x="-10"
          y="-10"
        />
        <!-- 4. Empty: Empty is Empty! -->
        <template v-else />
        <!-- 5. Load/Unload Failed -->
        <VehicleCargoTransferFailSvg
          v-if="props.cargoTransferResult"
          width="26"
          height="26"
          x="-13"
          y="-13"
        />
        <!-- cargo state end -->

        <!-- vehicle id -->
        <!-- 📐🛑 Be careful! logic is dependent on invert -->
        <text
          class="select-none"
          text-rendering="optimizeSpeed"
          transform="scale(1 -1) translate(-25 -2)"
          text-anchor="end"
          alignment-baseline="baseline"
        >{{ props.logicalId }}</text>
        <!-- vehicle order with priority(hotlot) -->
        <g :filter="isHotlot ? `url(#vehicle-order-hotlot-border)` : undefined">
          <!-- 📐🛑 Be careful! logic is dependent on invert -->
          <text
            v-if="props.orderId"
            class="select-none"
            text-rendering="optimizeSpeed"
            transform="scale(1 -1) translate(-25 2)"
            text-anchor="end"
            alignment-baseline="hanging"
            :filter="props.isHotlot ? `url(#vehicle-order-hotlot-background)` : undefined"
          >{{ props.orderId }}</text>
        </g>

        <!-- vehicle properties ordered by priority ==== START -->

        <!-- top left (2) -->
        <!-- 1. Blocked -->
        <VehicleStateBlockSvg v-if="props.isBlocked" x="-80" y="80" width="20" height="20" />
        <!-- <circle v-if="props.isBlocked" cx="-80" cy="80" r="20" fill="red" /> -->
        <!-- 2. Sensor Stop -->
        <VehicleStateSensorStopSvg
          v-else-if="props.isSensorStopped"
          x="-80"
          y="80"
          width="15"
          height="15"
        />
        <!-- <circle
          v-else-if="props.isSensorStopped"
          cx="-80"
          cy="80"
          r="15"
          stroke="rgb(255, 90, 90)"
          stroke-width="5"
          fill="rgb(255, 192, 203)"
        />-->
        <template v-else />

        <!-- top right (1) -->
        <!-- 1. Stale -->
        <!-- where is staled -->
        <VehicleStateStaleSvg v-if="props.isStale" x="80" y="80" width="15" height="15" />
        <!-- <path
          v-if="props.isStale"
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
        />-->

        <!-- bottom left (1) -->
        <!-- 1. Error -->
        <!-- triangle with width 40 and height 30 -->
        <VehicleStateErrorSvg v-if="props.errorList" x="-80" y="-80" width="20" height="15" />
        <!-- <path
          v-if="props.errorList"
          fill="yellow"
          stroke="orange"
          stroke-width="5"
          d="
      M -80 -65 
      L -100 -95 
      L -60 -95 
      Z"
        />-->

        <!-- bottom right (4) -->
        <!-- 1. Disconnected -->
        <VehicleStateDisconnectedSvg v-if="props.isConnected === false" width="40" height="40" />
        <!-- <path
          v-if="props.isConnected === false"
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
        />-->
        <!-- 2. Maintained -->
        <VehicleStateMaintainedSvg v-else-if="props.isMaint" width="50" height="50" x="80" y="-80" />
        <!-- 3. Prevent Call or Prevent Push -->
        <template v-else-if="props.isPreventCall || props.isPreventPush">
          <!-- 3-A. Prevent Call -->
          <VehicleStatePreventCallSvg
            v-if="props.isPreventCall"
            width="50"
            height="50"
            x="80"
            y="-80"
          />
          <!-- 3-B. Prevent Push -->
          <VehicleStatePreventPushSvg
            v-if="props.isPreventPush"
            width="50"
            height="50"
            x="80"
            y="-80"
          />
        </template>
        <template v-else />

        <!-- vehicle properties ordered by priority ==== END -->
      </MapReverseRotate>
    </ScaleByScale>
  </symbol>
</template>