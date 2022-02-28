import { Position } from "src/types/Position"
import { cameraInfo, getHeightFromWidthAndRatio, getWidthFromHeightAndRatio, moveCamera, resizeViewBox } from "./map/camera"
import { mapSizePropertiesInfo } from "./map/mapSizeProperties"
import { rotate, rotationInfo } from "./rotate/rotate"

type Objective = {
  position: Position,
  viewBox: {
    width: number,
    height: number,
  },
  rotation: number
}

function getCameraAndRotation() {
  return {
    position: { x: cameraInfo.value.centerX, y: cameraInfo.value.centerY },
    viewBox: { width: cameraInfo.value.viewBoxWidth, height: cameraInfo.value.viewBoxHeight },
    rotation: rotationInfo.value
  }
}

function initCameraAndRotation() {
  moveCamera({ x: mapSizePropertiesInfo.value.centerX, y: mapSizePropertiesInfo.value.centerY })
  centerZoom()
}

function centerZoom() {
  approachIterative({
    position: {
      x: mapSizePropertiesInfo.value.centerX,
      y: mapSizePropertiesInfo.value.centerY
    },
    viewBox: cameraInfo.value.viewBoxHeight > cameraInfo.value.viewBoxWidth
      ? {
        width: mapSizePropertiesInfo.value.width * 2,
        height: getHeightFromWidthAndRatio(mapSizePropertiesInfo.value.width * 2)
      }
      : {
        width: getWidthFromHeightAndRatio(mapSizePropertiesInfo.value.height * 2),
        height: mapSizePropertiesInfo.value.height * 2,
      },
    rotation: 0
  })
}

function approachToPosition(position: Position) {
  approachIterative({
    position,
    rotation: rotationInfo.value,
    viewBox: {
      width: getWidthFromHeightAndRatio(3000),
      height: 3000, //mm
    }
  })
}


const AnimationFrameCount = 20
let isApproaching = false
function approachIterative(objective: Objective) {
  if (isApproaching) return
  else isApproaching = true

  let current = {
    position: {
      x: cameraInfo.value.centerX,
      y: cameraInfo.value.centerY
    },
    viewBox: {
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
    viewBox: {
      width: (objective.viewBox.width - current.viewBox.width) / AnimationFrameCount,
      height: (objective.viewBox.height - current.viewBox.height) / AnimationFrameCount,
    },
    rotation: (current.rotation - objective.rotation) / AnimationFrameCount
  }

  let count = 0

  function step() {
    if (count === AnimationFrameCount) {
      isApproaching = false
      return
    }

    const next = {
      position: {
        x: current.position.x + term.position.x,
        y: current.position.y + term.position.y,
      },
      viewBox: {
        width: current.viewBox.width + term.viewBox.width,
        height: current.viewBox.height + term.viewBox.height
      },
      rotation: current.rotation - term.rotation
    }

    moveCamera(next.position)
    resizeViewBox(next.viewBox.width, next.viewBox.height)
    rotate(next.rotation)

    current = next
    count += 1

    setTimeout(() => { globalThis.requestAnimationFrame(step) }, 20);
  }
  step()
}


export { getCameraAndRotation, initCameraAndRotation, centerZoom, approachToPosition }