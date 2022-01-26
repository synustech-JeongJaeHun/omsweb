<script setup lang="ts">
import { Mtl } from '../types/Mtl'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { toRef } from 'vue';
import { usePointPoisiton } from '../../point/points';
import { useGroupColor } from '../../group/groups';

const props = defineProps<{
  mtl: Mtl
}>()

const position = usePointPoisiton(toRef(props.mtl, 'pointId'))
const groupColor = useGroupColor('mtl', toRef(props.mtl, 'id'))

</script>

<template>
  <svg class="overflow-visible cursor-pointer" :x="position.x" :y="position.y">
    <use
      v-show="groupColor"
      href="#mtl"
      class="group-shadow"
      :stroke="groupColor"
      stroke-width="15"
    />
    <use href="#mtl" stroke="black" stroke-width="5" />
    <RasterizedText class="invert" y="70" :text="props.mtl.logicalId" />
  </svg>
</template>
