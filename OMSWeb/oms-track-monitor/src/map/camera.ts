import { computed, reactive, readonly } from "vue";
import { Position } from "../types/Position";
import { mapSizePropertiesInfo } from "./mapSizeProperties";

const
  DefaultWidth = 1000,
  DefaultHeight = 1000,
  CornerMargin = 1000,
  MiminumViewBoxCornerLength = 100

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
  elementWidth: DefaultWidth,
  elementHeight: DefaultHeight,
  rotate: 0,
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
  // go!
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
  const isCameraGoingCenterX =
    Math.abs(mapSizePropertiesInfo.value.centerX - center.x) < Math.abs(mapSizePropertiesInfo.value.centerX - cameraInfo.value.centerX)

  const isVerticalMoveBeyondCorner =
    screenMinY > mapSizePropertiesInfo.value.maxY + CornerMargin
    || screenMaxY < mapSizePropertiesInfo.value.minY - CornerMargin
  const isCameraGoingCenterY =
    Math.abs(mapSizePropertiesInfo.value.centerY - center.y) < Math.abs(mapSizePropertiesInfo.value.centerY - cameraInfo.value.centerY)

  if (isHorizontalMoveBeyondCorner === false || isCameraGoingCenterX)
    camera.x = center.x - halfWidth

  if (isVerticalMoveBeyondCorner === false || isCameraGoingCenterY)
    camera.y = center.y - halfHeight
}

function initCamera() {
  moveCamera({ x: mapSizePropertiesInfo.value.centerX, y: mapSizePropertiesInfo.value.centerY })
  resizeViewBox('width', mapSizePropertiesInfo.value.width / 2)
}

function zoom(action: "In" | "Out", position: Position) {
  // TODO using position
  if (action === 'In') {
    const width = cameraInfo.value.viewBoxWidth * 0.8
    // ZoomIn Validation
    if (width > MiminumViewBoxCornerLength) resizeViewBox('width', width)
  }
  else {
    // ZoomOut Validation
    if (cameraInfo.value.viewBoxWidth > mapSizePropertiesInfo.value.width * 2
      && cameraInfo.value.viewBoxHeight > mapSizePropertiesInfo.value.width * 2
    ) return

    resizeViewBox('width', cameraInfo.value.viewBoxWidth * 1.2)
  }
}
function pan(movementX: number, movementY: number) {
  moveCamera({
    x: cameraInfo.value.centerX - (0.001 * movementX * cameraInfo.value.viewBoxWidth),
    y: cameraInfo.value.centerY - (0.001 * movementY * cameraInfo.value.viewBoxHeight)
  })
}


function rotate(degree: number) {
  camera.rotate = degree
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
    // if (absY > absX && movementY > 0)
    //   return "Up"
    // if (absY > absX && movementY < 0)
    //   return "Down"
  })()

  switch (direction) {
    case "Left":
      rotate((cameraInfo.value.rotate + 15) % 360)
      break;

    case "Right":
      rotate((cameraInfo.value.rotate + 345) % 360)
      break;

    default:
      break;
  }
}

export { cameraInfo, initCamera, resizeElement, zoom, pan, rotateByMouse, moveCamera }