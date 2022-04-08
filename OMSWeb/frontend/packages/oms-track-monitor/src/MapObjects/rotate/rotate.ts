import { readonly, ref } from "vue";

const rotation = ref(0)
const rotationInfo = readonly(rotation)

function rotate(degree: number) {
  rotation.value = degree
}

const isRotating = ref(false)

function enterRotating() {
  isRotating.value = true
}
function exitRotating() {
  isRotating.value = false
}

function rotateToByMouse(event: MouseEvent) {
  if (Math.abs(event.movementX) > 3) {
    // 📐🛑 Be careful! logic is dependent on invert
    const
      movementX = event.movementX,
      movementY = event.movementY * (-1)

    const direction = (function () {
      const
        absX = Math.abs(movementX),
        absY = Math.abs(movementY)

      if (absX > absY && movementX > 0) return "Right"
      if (absX > absY && movementX < 0) return "Left"
    })()

    if (direction === undefined) return

    const degree = direction === 'Left'
      ? (rotationInfo.value + 15) % 360
      : (rotationInfo.value + 345) % 360

    rotate(degree)
  }
}


export { rotationInfo, rotate, isRotating, enterRotating, exitRotating, rotateToByMouse }