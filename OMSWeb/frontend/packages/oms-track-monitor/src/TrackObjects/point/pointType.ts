import { readonly, ref } from 'vue'
import {Stringlish} from "src/Root/types/Prop";
enum PointType {
  ID = 'ID',
  BCR = 'Barcode',
  ID_BCR = 'ID(Barcode)'
}
type displayType = keyof typeof PointType

const pointType = ref<displayType>(PointType.ID)

const readonlyPointType = readonly(pointType)

function updatePointType(value: Stringlish) {
  pointType.value = value as displayType
}

export { readonlyPointType, updatePointType, PointType }
