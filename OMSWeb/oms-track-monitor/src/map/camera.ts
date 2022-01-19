import { computed, reactive, readonly } from "vue";
import { Position } from "../types/Position";
import { mapSizePropertiesInfo } from "./mapSizeProperties";

const
  DefaultWidth = 1000,
  DefaultHeight = 1000,
  CornerMargin = 1000,
  ZoomLevel3 = 7500,
  ZoomLevel2 = 35000,
  ZoomLevel1 = 70000,
  ZoomLevel0 = 140000

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
  maxX: camera.x + camera.viewBoxWidth,
  maxY: camera.x + camera.viewBoxHeight,
  ratio: camera.elementWidth / camera.elementHeight,
  viewBox: `${camera.x} ${camera.y} ${camera.viewBoxWidth} ${camera.viewBoxHeight}`,
  zoomLevel: (() => {
    const smallCorner = Math.min(camera.viewBoxHeight, camera.viewBoxWidth)
    return smallCorner < ZoomLevel3 ? 3
      : smallCorner < ZoomLevel2 ? 2
        : smallCorner < ZoomLevel1 ? 1
          : 0
  })()
})))

function resizeViewBox(widthOrHeight: "width" | "height", value: number) {
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


function moveCamera(center: Position) {
  const
    halfWidth = cameraInfo.value.viewBoxWidth / 2,
    halfHeight = cameraInfo.value.viewBoxHeight / 2,
    screenMinX = center.x - halfWidth,
    screenMinY = center.y - halfHeight,
    screenMaxX = center.x + halfWidth,
    screenMaxY = center.y + halfHeight

  const isHorizontalMoveBeyondCorner =
    screenMinX > mapSizePropertiesInfo.value.maxX + CornerMargin
    || screenMaxX < mapSizePropertiesInfo.value.minX - CornerMargin

  const isVerticalMoveBeyondCorner =
    screenMinY > mapSizePropertiesInfo.value.maxY + CornerMargin
    || screenMaxY < mapSizePropertiesInfo.value.minY - CornerMargin

  if (isHorizontalMoveBeyondCorner === false)
    camera.x = center.x - halfWidth

  if (isVerticalMoveBeyondCorner === false)
    camera.y = center.y - halfHeight
}


function initCamera() {
  moveCamera({ x: mapSizePropertiesInfo.value.centerX, y: mapSizePropertiesInfo.value.centerY })
  resizeViewBox('width', mapSizePropertiesInfo.value.width / 2)
}

function zoomIn(position: Position) {
  // TODO using position
  resizeViewBox('width', cameraInfo.value.viewBoxWidth * 0.8)
}
function zoomOut(position: Position) {
  // TODO using position
  if (cameraInfo.value.viewBoxWidth > mapSizePropertiesInfo.value.width * 2
    && cameraInfo.value.viewBoxHeight > mapSizePropertiesInfo.value.width * 2
  ) return

  resizeViewBox('width', cameraInfo.value.viewBoxWidth * 1.2)
}
function pan(movementX: number, movementY: number) {
  moveCamera({
    x: cameraInfo.value.centerX - (0.001 * movementX * cameraInfo.value.viewBoxWidth),
    y: cameraInfo.value.centerY - (0.001 * movementY * cameraInfo.value.viewBoxHeight)
  })
}

export { cameraInfo, initCamera, resizeViewBox, resizeElement, zoomOut, zoomIn, pan, moveCamera }