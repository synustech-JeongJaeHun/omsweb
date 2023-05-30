import { readonly, ref } from 'vue'

const colors = ref<string[]>([])
const readonlyColors = readonly(colors)

function updateColors(values: string[]) {
  colors.value = values
}

export { readonlyColors, updateColors }
