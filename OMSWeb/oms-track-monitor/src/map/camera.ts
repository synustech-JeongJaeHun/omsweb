import { computed, reactive, readonly, watchEffect } from "vue";
import { mapSizePropertiesInfo } from "./mapSizeProperties";

const
  DefaultWidth = 1000,
  DefaultHeight = 1000,
  CornerMargin = 1000

const camera = reactive({
  x: 0,
  y: 0,
  viewBoxWidth: DefaultWidth,
  viewBoxHeight: DefaultHeight,
  elementWidth: DefaultWidth,
  elementHeight: DefaultHeight,
})

const cameraInfo = readonly(computed(() => ({
  ...camera,
  centerX: camera.x + (camera.viewBoxWidth / 2),
  centerY: camera.y + (camera.viewBoxHeight / 2),
  ratio: camera.elementWidth / camera.elementHeight,
  widthPx: `${camera.elementWidth}px`,
  heightPx: `${camera.elementHeight}px`,
  viewBox: `${camera.x} ${camera.y} ${camera.viewBoxWidth} ${camera.viewBoxHeight}`,
})))

function resizeViewBox(widthOrHeight: "width" | "height", value: number) {
  console.log("resize", arguments)

  if (value < 0) return
  const
    width = widthOrHeight === 'width' ? value : value * cameraInfo.value.ratio,
    height = widthOrHeight === 'height' ? value : value / cameraInfo.value.ratio

  camera.x = cameraInfo.value.centerX - (width / 2)
  camera.y = cameraInfo.value.centerY - (height / 2)
  camera.viewBoxWidth = width
  camera.viewBoxHeight = height
}

function resizeElement(width: number, height: number) {
  camera.elementWidth = width
  camera.elementHeight = height

  resizeViewBox('width', cameraInfo.value.viewBoxWidth)
}


function moveCamera(centerX: number, centerY: number) {
  const
    halfWidth = cameraInfo.value.viewBoxWidth / 2,
    halfHeight = cameraInfo.value.viewBoxHeight / 2,
    screenMinX = centerX - halfWidth,
    screenMinY = centerY - halfHeight,
    screenMaxX = centerX + halfWidth,
    screenMaxY = centerY + halfHeight

  const isHorizontalMoveBeyondCorner =
    screenMinX > mapSizePropertiesInfo.value.maxX + CornerMargin
    || screenMaxX < mapSizePropertiesInfo.value.minX - CornerMargin

  const isVerticalMoveBeyondCorner =
    screenMinY > mapSizePropertiesInfo.value.maxY + CornerMargin
    || screenMaxY < mapSizePropertiesInfo.value.minY - CornerMargin

  if (isHorizontalMoveBeyondCorner === false)
    camera.x = centerX - halfWidth

  if (isVerticalMoveBeyondCorner === false)
    camera.y = centerY - halfHeight
}


function initCamera() {
  moveCamera(mapSizePropertiesInfo.value.centerX, mapSizePropertiesInfo.value.centerY)
  resizeViewBox('width', mapSizePropertiesInfo.value.width / 2)
}

function zoomIn(x: number, y: number) {
  resizeViewBox('width', cameraInfo.value.viewBoxWidth * 0.8)
}
function zoomOut(x: number, y: number) {
  if (cameraInfo.value.viewBoxWidth > mapSizePropertiesInfo.value.width * 2
    && cameraInfo.value.viewBoxHeight > mapSizePropertiesInfo.value.width * 2
  ) return

  resizeViewBox('width', cameraInfo.value.viewBoxWidth * 1.2)
}
function pan(movementX: number, movementY: number) {
  const
    centerX = cameraInfo.value.centerX - (0.001 * movementX * cameraInfo.value.viewBoxWidth),
    centerY = cameraInfo.value.centerY - (0.001 * movementY * cameraInfo.value.viewBoxHeight)

  moveCamera(centerX, centerY)
}

export { cameraInfo, initCamera, resizeViewBox, resizeElement, zoomOut, zoomIn, pan }