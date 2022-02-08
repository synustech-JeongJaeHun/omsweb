import { computed, reactive, readonly, watch } from "vue";
import { Position } from "../types/Position";
import { DefaultHeight, DefaultWidth } from "./default";
import { elementRectInfo } from "./elementRect";
import { mapSizePropertiesInfo } from "./mapSizeProperties";

const
  ZoomLevel3 = 7500,
  ZoomLevel2 = 35000,
  ZoomLevel1 = 70000,
  ZoomLevel0 = 140000

const camera = reactive({
  x: 0,
  y: 0,
  viewBoxWidth: DefaultWidth,
  viewBoxHeight: DefaultHeight,
  ratio: DefaultWidth / DefaultHeight
})

const cameraInfo = readonly(computed(() => ({
  ...camera,
  centerX: camera.x + (camera.viewBoxWidth / 2),
  centerY: camera.y + (camera.viewBoxHeight / 2),
  maxX: camera.x + camera.viewBoxWidth,
  maxY: camera.x + camera.viewBoxHeight,
  viewBox: `${Math.ceil(camera.x)} ${Math.ceil(camera.y)} ${Math.ceil(camera.viewBoxWidth)} ${Math.ceil(camera.viewBoxHeight)}`,
  zoomLevel: (() => {
    const smallCorner = Math.min(camera.viewBoxHeight, camera.viewBoxWidth)
    return smallCorner < ZoomLevel3 ? 3
      : smallCorner < ZoomLevel2 ? 2
        : smallCorner < ZoomLevel1 ? 1
          : 0
  })()
})))

function getWidthFromHeightAndRatio(height: number) {
  return cameraInfo.value.ratio * height
}

function getHeightFromWidthAndRatio(width: number) {
  return width / cameraInfo.value.ratio
}

function resizeViewBox(width: number, height: number) {
  camera.x = cameraInfo.value.centerX - (width / 2)
  camera.y = cameraInfo.value.centerY - (height / 2)
  camera.viewBoxWidth = width
  camera.viewBoxHeight = height
}

function moveCamera(center: Position) {
  const
    halfWidth = cameraInfo.value.viewBoxWidth / 2,
    halfHeight = cameraInfo.value.viewBoxHeight / 2

  camera.x = center.x - halfWidth
  camera.y = center.y - halfHeight
}

watch(elementRectInfo, () => {
  camera.ratio = elementRectInfo.width / elementRectInfo.height

  if (elementRectInfo.width > elementRectInfo.height)
    resizeViewBox(
      cameraInfo.value.viewBoxWidth,
      getHeightFromWidthAndRatio(cameraInfo.value.viewBoxWidth)
    )

  else
    resizeViewBox(
      getWidthFromHeightAndRatio(cameraInfo.value.viewBoxHeight),
      cameraInfo.value.viewBoxHeight
    )

  moveCamera({ x: cameraInfo.value.centerX, y: cameraInfo.value.centerY })
})

const AnimationFrameCount = 20
let isIniting = false
function initCamera() {
  if (isIniting) return
  else isIniting = true

  const objective = {
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
      }
  }

  let current = {
    position: {
      x: cameraInfo.value.centerX,
      y: cameraInfo.value.centerY
    },
    rect: {
      width: cameraInfo.value.viewBoxWidth,
      height: cameraInfo.value.viewBoxHeight
    }
  }

  const term = {
    position: {
      x: (objective.position.x - current.position.x) / AnimationFrameCount,
      y: (objective.position.y - current.position.y) / AnimationFrameCount,
    },
    rect: {
      width: (objective.rect.width - current.rect.width) / AnimationFrameCount,
      height: (objective.rect.height - current.rect.height) / AnimationFrameCount,
    }
  }

  let count = 0

  function step() {
    if (count === AnimationFrameCount
      || (
        current.position.x === term.position.x
        && current.position.y === term.position.y
        && current.rect.width === term.rect.width
        && current.rect.height === term.rect.height
      )) {
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
      }
    }

    moveCamera(next.position)
    resizeViewBox(next.rect.width, next.rect.height)

    current = next
    count += 1

    setTimeout(() => { globalThis.requestAnimationFrame(step) }, 20);
  }
  step()
}

function zoom(action: "In" | "Out", position: Position) {
  // TODO using position
  if (action === 'In') {
    const
      width = cameraInfo.value.viewBoxWidth * 0.7,
      height = getHeightFromWidthAndRatio(width)
    resizeViewBox(width, height)
  }
  else {
    const
      width = cameraInfo.value.viewBoxWidth * 1.3,
      height = getHeightFromWidthAndRatio(width)

    resizeViewBox(width, height)
  }
}

function pan(movementX: number, movementY: number) {
  moveCamera({
    x: cameraInfo.value.centerX - (0.003 * movementX * cameraInfo.value.viewBoxWidth),
    y: cameraInfo.value.centerY - (0.003 * movementY * cameraInfo.value.viewBoxHeight)
  })
}

export { cameraInfo, initCamera, resizeViewBox, zoom, pan, moveCamera }