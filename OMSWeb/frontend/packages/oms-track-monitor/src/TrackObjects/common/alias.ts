import { readonly, ref } from 'vue'

enum IdType {
  ID = 'ID',
  ALIAS = 'Alias'
}
type displayType = keyof typeof IdType
const idType = ref<displayType>(IdType.ID)
const readonlyIdType = readonly(idType)

function updateIdType(value: displayType) {
  idType.value = value
}

export { readonlyIdType, updateIdType, IdType }
