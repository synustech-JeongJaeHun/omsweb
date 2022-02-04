<script setup lang="ts">
import { Zcu } from '../types/Zcu'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';

const props = defineProps<{
  zcu: Zcu
}>()
</script>

<template>
  <svg class="overflow-visible cursor-pointer" :x="props.zcu.x" :y="props.zcu.y">
    <use href="#zcu" />
    <!-- <text y="70">{{ props.zcu.id }}</text> -->
    <RasterizedText y="70" :text="String(props.zcu.id)" />
  </svg>
</template>