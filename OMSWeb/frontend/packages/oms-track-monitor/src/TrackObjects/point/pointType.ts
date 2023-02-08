import { readonly, ref } from 'vue'

const pointType = ref<boolean>(false)
const readonlyPointType = readonly(pointType)

function updatePointType(value: boolean) {
  pointType.value = value
}

export { readonlyPointType, updatePointType }
