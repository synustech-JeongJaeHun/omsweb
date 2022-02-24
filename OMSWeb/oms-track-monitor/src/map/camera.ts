import { computed, reactive, readonly, ref, watch } from "vue";
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

function zoom(action: "In" | "Out", position: Position, count: number) {
  // TODO using position
  if (action === 'In') {
    const
      width = cameraInfo.value.viewBoxWidth * (0.7 ** count),
      height = getHeightFromWidthAndRatio(width)
    resizeViewBox(width, height)
  }
  else {
    const
      width = cameraInfo.value.viewBoxWidth * (1.3 ** count),
      height = getHeightFromWidthAndRatio(width)

    resizeViewBox(width, height)
  }
}

// element event listener
function zoomIn1Time(event: MouseEvent) {
  zoom('In', { x: event.clientX, y: event.clientY }, 1)
}

const MaximumZoomCount = 3
let zoomCount = 0
let zoomAction: "Out" | "In" | undefined = undefined
let zoomDebounceTimeoutId: number | undefined = undefined
function zoomInOutByWheel(event: WheelEvent) {
  const action = event.deltaY > 0 ? 'Out' : 'In'

  if (zoomCount === 0) zoomAction = action

  if (zoomAction === action) {
    if (zoomCount > MaximumZoomCount && zoomDebounceTimeoutId) return

    clearTimeout(zoomDebounceTimeoutId)
    zoomCount += 1

    // @ts-ignore
    zoomDebounceTimeoutId = setTimeout(() => {
      zoom(action, { x: event.clientX, y: event.clientY }, zoomCount > MaximumZoomCount ? MaximumZoomCount : zoomCount)
      zoomCount = 0
      zoomAction = undefined
      zoomDebounceTimeoutId = undefined
    }, 55);
  }
}

const
  isPanning = ref(false),
  hasPanned = ref(false)

function enterPanning() { isPanning.value = true }

function exitPanning() { isPanning.value = false }

function handleMouseUp(emitBackdrop: () => void) {
  if (hasPanned.value === false) emitBackdrop()
  hasPanned.value = false
}

function panByMouse(event: MouseEvent) {
  const { movementX, movementY } = event

  moveCamera({
    x: cameraInfo.value.centerX - (0.003 * movementX * cameraInfo.value.viewBoxWidth),
    // 📐🛑 Be careful! logic is dependent on invert
    y: cameraInfo.value.centerY - (0.003 * (-1) * movementY * cameraInfo.value.viewBoxHeight)
  })
  hasPanned.value = true
}

export {
  cameraInfo,
  resizeViewBox,
  moveCamera,
  zoomIn1Time,
  zoomInOutByWheel,
  isPanning,
  enterPanning,
  exitPanning,
  panByMouse,
  handleMouseUp,
  getHeightFromWidthAndRatio,
  getWidthFromHeightAndRatio
}