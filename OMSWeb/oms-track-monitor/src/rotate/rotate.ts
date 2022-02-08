import { readonly, ref } from "vue";

const rotation = ref(0)
const rotationInfo = readonly(rotation)

function rotate(degree: number) {
  rotation.value = degree
}

function rotateByMouse(movementX: number, movementY: number) {
  const direction = (function () {
    const
      absX = Math.abs(movementX),
      absY = Math.abs(movementY)

    if (absX > absY && movementX > 0)
      return "Right"
    if (absX > absY && movementX < 0)
      return "Left"
  })()

  switch (direction) {
    case "Left":
      rotate((rotationInfo.value + 15) % 360)
      break;

    case "Right":
      rotate((rotationInfo.value + 345) % 360)
      break;

    default:
      break;
  }
}


export { rotationInfo, rotate, rotateByMouse }