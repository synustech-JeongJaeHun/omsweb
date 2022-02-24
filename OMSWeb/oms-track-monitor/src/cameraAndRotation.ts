import { cameraInfo, getHeightFromWidthAndRatio, getWidthFromHeightAndRatio, moveCamera, resizeViewBox } from "./map/camera"
import { mapSizePropertiesInfo } from "./map/mapSizeProperties"
import { rotate, rotationInfo } from "./rotate/rotate"

function initCameraAndRotation() {
  moveCamera({ x: mapSizePropertiesInfo.value.centerX, y: mapSizePropertiesInfo.value.centerY })
  centerZoom()
}

const AnimationFrameCount = 20
let isIniting = false
function centerZoom() {
  if (isIniting) return
  else isIniting = true

  function getObjective() {
    return {
      position: {
        x: mapSizePropertiesInfo.value.centerX,
        y: mapSizePropertiesInfo.value.centerY
      },
      rect: cameraInfo.value.viewBoxHeight > cameraInfo.value.viewBoxWidth
        ? {
          width: mapSizePropertiesInfo.value.width * 2,
          height: getHeightFromWidthAndRatio(mapSizePropertiesInfo.value.width * 2)
        }
        : {
          width: getWidthFromHeightAndRatio(mapSizePropertiesInfo.value.height * 2),
          height: mapSizePropertiesInfo.value.height * 2,
        },
      rotation: 0
    }
  }

  const objective = getObjective()

  let current = {
    position: {
      x: cameraInfo.value.centerX,
      y: cameraInfo.value.centerY
    },
    rect: {
      width: cameraInfo.value.viewBoxWidth,
      height: cameraInfo.value.viewBoxHeight
    },
    rotation: rotationInfo.value
  }

  const term = {
    position: {
      x: (objective.position.x - current.position.x) / AnimationFrameCount,
      y: (objective.position.y - current.position.y) / AnimationFrameCount,
    },
    rect: {
      width: (objective.rect.width - current.rect.width) / AnimationFrameCount,
      height: (objective.rect.height - current.rect.height) / AnimationFrameCount,
    },
    rotation: (current.rotation - objective.rotation) / AnimationFrameCount
  }

  let count = 0

  function step() {
    if (count === AnimationFrameCount) {
      isIniting = false
      return
    }

    const next = {
      position: {
        x: current.position.x + term.position.x,
        y: current.position.y + term.position.y,
      },
      rect: {
        width: current.rect.width + term.rect.width,
        height: current.rect.height + term.rect.height
      },
      rotation: current.rotation - term.rotation
    }

    moveCamera(next.position)
    resizeViewBox(next.rect.width, next.rect.height)
    rotate(next.rotation)

    current = next
    count += 1

    setTimeout(() => { globalThis.requestAnimationFrame(step) }, 20);
  }
  step()
}

function getCameraAndRotation() {
  return {
    position: { x: cameraInfo.value.centerX, y: cameraInfo.value.centerY },
    viewBox: { width: cameraInfo.value.viewBoxWidth, height: cameraInfo.value.viewBoxHeight },
    rotation: rotationInfo.value
  }
}

export { initCameraAndRotation, centerZoom, getCameraAndRotation }