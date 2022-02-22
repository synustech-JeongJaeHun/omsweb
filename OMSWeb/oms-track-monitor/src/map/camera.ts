import { computed, reactive, readonly, watch } from "vue";
import { Position } from "../types/Position";
import { DefaultHeight, DefaultWidth } from "./default";
import { elementRectInfo } from "./elementRect";

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
  viewBox: `${Math.ceil(camera.x)} ${Math.ceil(camera.y)} ${Math.ceil(camera.viewBoxWidth)} ${Math.ceil(camera.viewBoxHeight)}`
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

export {
  cameraInfo,
  resizeViewBox,
  zoom,
  pan,
  moveCamera,
  getHeightFromWidthAndRatio,
  getWidthFromHeightAndRatio
}