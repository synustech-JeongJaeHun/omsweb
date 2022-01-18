<script setup lang="ts">
import { Vehicle } from '../types/Vehicle'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { usePointPoisiton } from '../../point/points';
import { computed, inject, reactive, readonly, Ref, toRef, watch } from 'vue';
import { findSegmentByPoints } from '../../segment/segments';
import { makePathFromSegment } from '../../segment/utils/path';

const props = defineProps<{
  vehicle: Vehicle
}>()

const
  currentPointId = toRef(props.vehicle, 'curPoint'),
  currnetPointPosition = usePointPoisiton(currentPointId),
  nextPointId = toRef(props.vehicle, 'nextPoint'),
  nextPointPosition = usePointPoisiton(nextPointId)

const shadowRoot = inject<Ref<ShadowRoot>>('shadowRoot')

const segment = readonly(computed(() => findSegmentByPoints(currentPointId.value, nextPointId.value)))
// const segmentPathElement = shadowRoot?.value.getElementById(segment.value?.id ?? 0)


// const path = readonly(computed(() =>
//   segment.value
//     ? makePathFromSegment(currnetPointPosition.value, nextPointPosition.value, segment.value.parts, segment.value.length)
//     : ``
// ))

const previousPosition = reactive({ x: 0, y: 0 })
const nowPosition = readonly(computed(() => {



  return { x: 0, y: 0 }
}))

watch(nowPosition, (nowPosition, preNowPosition) => {

})

</script>

<template>
  <svg
    class="overflow-visible cursor-pointer"
    :x="currnetPointPosition.x"
    :y="currnetPointPosition.y"
  >
    <use href="#vehicle">
      <animateMotion path />
    </use>
    <RasterizedText y="70" :text="props.vehicle.logicalId" />
  </svg>
</template>