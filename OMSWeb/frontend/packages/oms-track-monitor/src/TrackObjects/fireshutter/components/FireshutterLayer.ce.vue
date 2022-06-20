<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import Fireshutter from './Fireshutter.ce.vue'
import { findFireshutterById, fireshutters } from '../fireshutters'
import { inject } from 'vue'
import { RootEmitInjectionKey, RootEmits } from 'src/Root/types/RootEmits'

// Root에서 선언한 RootEmits를 이 Layer에 inject(여기서 컨슈머로서 가져다 씀)
const emit = inject<RootEmits>(RootEmitInjectionKey)!

function getDeepCopiedFireshutter(event: MouseEvent) {
  const fsId = parseInt((event.currentTarget as SVGElement).dataset.id!)
  const fs = findFireshutterById(fsId)!
  return { ...fs }
}

function handleMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'FIRESHUTTER',
    value: getDeepCopiedFireshutter(event),
    event,
  })
}

function handleMouseleave(event: MouseEvent) {
  emit('mouseleaveOnObject')
}

function handleLeftClick(event: MouseEvent) {
  // 여기서 이제 emit으로 부모에게 이벤트가 발생했다고 알리는데
  // 그럼 실제 이벤트를 처리하는 부모는 어디?
  emit('mainClickOnObject', {
    type: 'FIRESHUTTER',
    value: getDeepCopiedFireshutter(event),
  })
}

function handleRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'FIRESHUTTER',
    value: getDeepCopiedFireshutter(event),
    event,
  })
}
</script>
<template>
  <Layer id="fireshutter-layer">
    <defs> </defs>
    <Fireshutter
      v-for="fireshutter of fireshutters"
      :key="fireshutter.id"
      :fireshutter="fireshutter"
      :handleMouseover="handleMouseover"
      :handleMouseleave="handleMouseleave"
      :handleLeftClick="handleLeftClick"
      :handleRightClick="handleRightClick"
    />
  </Layer>
</template>
