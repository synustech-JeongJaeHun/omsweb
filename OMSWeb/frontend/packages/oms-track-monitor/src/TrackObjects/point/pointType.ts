import { readonly, ref } from 'vue'
enum PointType {
  ID = 'ID',
  BCR = 'Barcode',
  ID_BCR = 'ID(Barcode)'
}
type displayType = keyof typeof PointType

const pointType = ref<displayType>(PointType.ID)

const readonlyPointType = readonly(pointType)

function updatePointType(value: displayType) {
  pointType.value = value
}

export { readonlyPointType, updatePointType, PointType }
