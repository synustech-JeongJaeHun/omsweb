import { readonly, ref } from 'vue'
import {Stringlish} from "src/Root/types/Prop";

enum IdType {
  ID = 'ID',
  ALIAS = 'Alias'
}
type displayType = keyof typeof IdType
const idType = ref<displayType>(IdType.ID)
const readonlyIdType = readonly(idType)

function updateIdType(value: Stringlish) {
  idType.value = value
}

export { readonlyIdType, updateIdType, IdType }
