<script setup lang="ts">
import { inject, toRef } from 'vue';
import { panByMouse, isPanning, enterPanning, exitPanning, zoomIn1Time, zoomInOutByWheel, handleMouseUp } from '../camera';
import { centerZoom } from '../../cameraAndRotation';
import GridLayer from './GridLayer.ce.vue';
import PointLayer from '../../point/components/PointLayer.ce.vue';
import BufferLayer from '../../buffer/components/BufferLayer.ce.vue';
import StationLayer from '../../station/components/StationLayer.ce.vue';
import ZcuLayer from '../../zcu/components/ZcuLayer.ce.vue';
import MtlLayer from '../../mtl/components/MtlLayer.ce.vue';
import VehicleLayer from '../../vehicle/components/VehicleLayer.ce.vue';
import SegmentLayer from '../../segment/components/SegmentLayer.ce.vue';
import ClusterLayer from '../../cluster/components/ClusterLayer.ce.vue';

import { elementRectInfo } from '../elementRect';
import { isRotating, rotateToByMouse, enterRotating, exitRotating } from '../../rotate/rotate';
import { RootEmitInjectionKey, RootEmits } from '../../types/RootEmits';
import { visibleStylesInfo } from '../../styles/styles';

const emit = inject<RootEmits>(RootEmitInjectionKey)!

const isGroupVisible = toRef(visibleStylesInfo, 'group')
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
    :data-is-group-visible="isGroupVisible"
    @wheel="zoomInOutByWheel($event)"
    @dblclick.self="zoomIn1Time($event)"
    @mousedown.left="enterPanning()"
    @mousedown.right="enterRotating()"
    @mousemove="isPanning && panByMouse($event), isRotating && rotateToByMouse($event)"
    @mouseleave="exitPanning(), exitRotating()"
    @mouseup="exitPanning(), exitRotating()"
    @click.left.self="handleMouseUp(() => emit('backdrop'))"
    @click.middle.prevent="centerZoom()"
    @click.right.prevent
  >
    <GridLayer />
    <ClusterLayer />
    <SegmentLayer />
    <PointLayer />
    <BufferLayer />
    <StationLayer />
    <ZcuLayer />
    <MtlLayer />
    <VehicleLayer />
  </svg>
</template>