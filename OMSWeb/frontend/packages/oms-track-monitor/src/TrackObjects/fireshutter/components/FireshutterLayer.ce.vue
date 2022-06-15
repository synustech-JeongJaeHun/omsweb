<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import FireShutter from './Fireshutter.ce.vue'
import { findFireshutterById,fireshutters } from '../fireshutters';
import { inject } from 'vue';
import { RootEmitInjectionKey,RootEmits } from 'src/Root/types/RootEmits';

// Root에서 선언한 RootEmits를 이 Layer에 inject(여기서 컨슈머로서 가져다 씀)
const emit = inject<RootEmits>(RootEmitInjectionKey)!

function getDeepCopiedFireshutter(event:MouseEvent) {
    const fsId = parseInt((event.target as SVGElement).dataset.id!)
    const fs = findFireshutterById(fsId)
    return {...fs}
}

</script>
<template>
<Layer id="fireshutter-layer">
    <!-- NOTE: 우선 svg로 불러서 띄우기 부터 선행 -->
    <defs>
    </defs>
    <FireShutter
    v-for="fireshutter of fireshutters"
    :key="fireshutter.id"
    :fireshutter="fireshutter"
    />


</Layer>

</template>
