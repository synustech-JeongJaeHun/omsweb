<script setup lang="ts">
import Layer from '../../map/components/Layer.vue';
import Zcu from './Zcu.vue';

import { zcus } from '../zcus'

</script>

<template>
  <Layer>
    <Zcu v-for="zcu of zcus" :key="zcu.id" :zcu="zcu" />
  </Layer>
</template>
