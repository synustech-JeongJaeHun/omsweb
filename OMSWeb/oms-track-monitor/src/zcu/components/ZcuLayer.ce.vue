<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Zcu from './Zcu.ce.vue';

import { zcus } from '../zcus'

</script>

<template>
  <Layer>
    <defs>
      <path
        id="zcu"
        d="M 0 -50 L 50 0 L 0 50 L -50 0 Z"
        stroke="black"
        stroke-width="10"
        fill="none"
      />
    </defs>
    <Zcu v-for="zcu of zcus" :key="zcu.id" :zcu="zcu" />
  </Layer>
</template>
