<script setup lang="ts">
import { inject } from 'vue'
import GridLayer from './GridLayer.ce.vue'
import PointLayer from 'TrackObjects/point/components/PointLayer.ce.vue'
import BufferLayer from 'TrackObjects/buffer/components/BufferLayer.ce.vue'
import StationLayer from 'TrackObjects/station/components/StationLayer.ce.vue'
import ZcuLayer from 'TrackObjects/zcu/components/ZcuLayer.ce.vue'
import MtlLayer from 'TrackObjects/mtl/components/MtlLayer.ce.vue'
import VehicleLayer from 'TrackObjects/vehicle/components/VehicleLayer.ce.vue'
import SegmentLayer from 'TrackObjects/segment/components/SegmentLayer.ce.vue'
import ClusterLayer from 'TrackObjects/cluster/components/ClusterLayer.ce.vue'
import DisabledSegmentLayer from 'src/TrackObjects/segment/components/DisabledSegmentLayer.ce.vue'
import FireshutterLayer from 'src/TrackObjects/fireshutter/components/FireshutterLayer.ce.vue'

import {
  panByMouse,
  isPanning,
  enterPanning,
  exitPanning,
  zoomIn1Time,
  zoomInOutByWheel,
  handleMouseUp,
} from '../camera'
import { centerZoom } from '../../cameraAndRotation'
import { elementRectInfo } from '../elementRect'
import {
  isRotating,
  rotateToByMouse,
  enterRotating,
  exitRotating,
} from 'MapObjects/rotate/rotate'
import { RootEmitInjectionKey, RootEmits } from 'src/Root/types/RootEmits'

const emit = inject<RootEmits>(RootEmitInjectionKey)!
</script>

<template>
  <svg
    id="layer-container"
    class="invert"
    :width="elementRectInfo.width"
    :height="elementRectInfo.height"
    :viewBox="`0 0 ${elementRectInfo.width} ${elementRectInfo.height}`"
    :data-is-panning="isPanning"
    :data-is-rotating="isRotating"
    @wheel="zoomInOutByWheel($event)"
    @dblclick.self="zoomIn1Time($event)"
    @mousedown.left="enterPanning()"
    @mousedown.right="enterRotating()"
    @mousemove="
      isPanning && panByMouse($event),
        isRotating && rotateToByMouse($event)
    "
    @mouseleave="exitPanning(), exitRotating()"
    @mouseup="exitPanning(), exitRotating()"
    @click.left.self="handleMouseUp(() => emit('clickOutObject'))"
    @click.middle.prevent="centerZoom()"
    @click.right.prevent
  >
    <GridLayer />
    <ClusterLayer />
    <SegmentLayer />
    <DisabledSegmentLayer />
    <PointLayer />
    <BufferLayer />
    <StationLayer />
    <ZcuLayer />
    <MtlLayer />
    <VehicleLayer />
    <FireshutterLayer />
  </svg>
</template>
