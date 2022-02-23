import { readonly, ref } from "vue";

const rotation = ref(0)
const rotationInfo = readonly(rotation)

function rotate(degree: number) {
  rotation.value = degree
}

export { rotationInfo, rotate }