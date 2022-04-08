import { reactive } from 'vue'

const rect = reactive({
  height: window.innerHeight,
  width: window.innerWidth,
})

window.addEventListener('resize', () => {
  rect.height = window.innerHeight
  rect.width = window.innerWidth
})

function useWindowRect() {
  return rect
}

export { useWindowRect }
