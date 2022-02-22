<script setup lang="ts">
import { computed } from 'vue';
import { scaleInfo } from '../scale';
import { Units } from '../Units';
import { getHumanReadableLength } from '../utils/si';

const LineMaxLength = 100

const scaleAtLineMaxLength = computed(() => LineMaxLength * scaleInfo.value.mmPerPixel)
const unit = computed(() => Units.find(level => scaleAtLineMaxLength.value < level) as number)
const lineLength = computed(() => unit.value / scaleAtLineMaxLength.value * LineMaxLength)

</script>

<template>
  <div>
    <span
      class="select-none"
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