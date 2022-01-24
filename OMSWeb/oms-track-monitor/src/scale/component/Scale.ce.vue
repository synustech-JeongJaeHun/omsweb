<script setup lang="ts">
import { computed, readonly } from 'vue';
import { cameraInfo } from '../../map/camera';
import { Units } from '../Units';
import { getHumanReadableLength } from '../utils/si';

const
  LineMaxLength = 100


const scale = readonly(computed(() => cameraInfo.value.viewBoxWidth / cameraInfo.value.elementWidth))
const scaleAtLineMaxLength = readonly(computed(() => LineMaxLength * scale.value))


const unit = readonly(computed(() => Units.find(level => scaleAtLineMaxLength.value < level) as number))


const lineLength = readonly(computed(() =>
  unit.value / scaleAtLineMaxLength.value * LineMaxLength))

</script>

<template>
  <div>
    <span
      style="font-size: 3px; font-weight: bold; margin-right: 5px;"
    >{{ getHumanReadableLength(unit) }}</span>
    <svg class="overflow-visible" :width="`${lineLength}px`" :viewBox="`0 -5 ${lineLength} 10`">
      <!-- start vertical -->
      <line x1="0" y1="3" x2="0" y2="-3" stroke="black" />
      <!-- scale -->
      <line x1="0" y1="0" :x2="lineLength" y2="0" stroke="black" />
      <!-- end vertical -->
      <line :x1="lineLength" y1="3" :x2="lineLength" y2="-3" stroke="black" />
    </svg>
  </div>
</template>