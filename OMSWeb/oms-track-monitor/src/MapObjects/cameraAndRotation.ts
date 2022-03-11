import { Position } from "src/types/Position"
import { cameraTotalInfo, moveCamera, resizeViewBox } from "./map/camera"
import { getHeightFromWidthAndRatio, getWidthFromHeightAndRatio } from "./map/elementRect"
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
    position: { x: cameraTotalInfo.value.centerX, y: cameraTotalInfo.value.centerY },
    viewBox: { width: cameraTotalInfo.value.viewBoxWidth, height: cameraTotalInfo.value.viewBoxHeight },
    rotation: rotationInfo.value
  }
}

/**
 * check this file to how map rotated
 * `src\MapObjects\rotate\components\MapRotate.ce.vue`
 */
function getRotatedPosition(position: Position) {
  // https://blog.naver.com/web2011/221367932781
  const origin = {
    x: mapSizePropertiesInfo.value.centerX,
    y: mapSizePropertiesInfo.value.centerY
  }

  const diff = {
    x: position.x - origin.x,
    y: position.y - origin.y,
  }

  const
    r = Math.hypot(diff.x, diff.y),
    p = Math.atan2(diff.y, diff.x) // in radians

  const rotated = ((p * 180 / Math.PI) + rotationInfo.value) / 180 * Math.PI // in radians

  const correction = {
    x: r * Math.cos(rotated) + origin.x,
    y: r * Math.sin(rotated) + origin.y,
  }

  return correction
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
    viewBox: cameraTotalInfo.value.viewBoxHeight > cameraTotalInfo.value.viewBoxWidth
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

function approachTo(position: Position) {
  approachIterative({
    position: getRotatedPosition(position),
    rotation: rotationInfo.value,
    viewBox: {
      width: getWidthFromHeightAndRatio(3000),
      height: 3000, //mm
    }
  })
}


// time with microsecond
// animation duration 2.0s with linear
const TotalAnimationDuration = 800
let isApproaching = false
function approachIterative(objective: Objective) {
  if (isApproaching) return
  else isApproaching = true

  const start = {
    position: {
      x: cameraTotalInfo.value.centerX,
      y: cameraTotalInfo.value.centerY
    },
    viewBox: {
      width: cameraTotalInfo.value.viewBoxWidth,
      height: cameraTotalInfo.value.viewBoxHeight
    },
    rotation: rotationInfo.value
  }

  const term = {
    position: {
      x: (objective.position.x - start.position.x),
      y: (objective.position.y - start.position.y),
    },
    viewBox: {
      width: (objective.viewBox.width - start.viewBox.width),
      height: (objective.viewBox.height - start.viewBox.height),
    },
    rotation: (objective.rotation + 360 - start.rotation) % 360
  }

  const startTime = performance.now()

  function step() {
    const now = performance.now()
    const passedInTotalRatio = (now - startTime) / TotalAnimationDuration

    if (passedInTotalRatio >= 1) {
      isApproaching = false

      moveCamera(objective.position)
      resizeViewBox(objective.viewBox.width, objective.viewBox.height)
      rotate(objective.rotation)

      return
    }


    moveCamera({
      x: start.position.x + term.position.x * passedInTotalRatio,
      y: start.position.y + term.position.y * passedInTotalRatio,
    })
    resizeViewBox(
      start.viewBox.width + term.viewBox.width * passedInTotalRatio,
      start.viewBox.height + term.viewBox.height * passedInTotalRatio
    )
    rotate(start.rotation + term.rotation * passedInTotalRatio)

    globalThis.requestAnimationFrame(step);
  }
  globalThis.requestAnimationFrame(step);
}


export { getCameraAndRotation, getRotatedPosition, initCameraAndRotation, centerZoom, approachTo }