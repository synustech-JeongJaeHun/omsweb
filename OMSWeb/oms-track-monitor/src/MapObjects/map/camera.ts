import { Position } from "src/types/Position";
import { computed, reactive, readonly, ref, watch } from "vue";
import { scaleInfo } from "../scale/scale";
import { DefaultHeight, DefaultWidth } from "./default";
import { elementRectInfo, getHeightFromWidthAndRatio, getWidthFromHeightAndRatio } from "./elementRect";

const cameraPosition = reactive({
  x: 0,
  y: 0,
})
const cameraPositionInfo = readonly(cameraPosition)

const cameraViewBox = reactive({
  width: DefaultWidth,
  height: DefaultHeight,
})
const cameraViewBoxInfo = readonly(cameraViewBox)

const cameraTotalInfo = readonly(computed(() => ({
  x: cameraPositionInfo.x,
  y: cameraPositionInfo.y,
  viewBoxWidth: cameraViewBoxInfo.width,
  viewBoxHeight: cameraViewBoxInfo.height,
  centerX: cameraPositionInfo.x + (cameraViewBoxInfo.width / 2),
  centerY: cameraPositionInfo.y + (cameraViewBoxInfo.height / 2),
  maxX: cameraPositionInfo.x + cameraViewBoxInfo.width,
  maxY: cameraPositionInfo.x + cameraViewBoxInfo.height,
  viewBox: `${Math.ceil(cameraPositionInfo.x)} ${Math.ceil(cameraPositionInfo.y)} ${Math.ceil(cameraViewBoxInfo.width)} ${Math.ceil(cameraViewBoxInfo.height)}`
})))

function resizeViewBox(width: number, height: number) {
  cameraPosition.x = cameraTotalInfo.value.centerX - (width / 2)
  cameraPosition.y = cameraTotalInfo.value.centerY - (height / 2)
  cameraViewBox.width = width
  cameraViewBox.height = height
}

function moveCamera(center: Position) {
  const
    halfWidth = cameraViewBoxInfo.width / 2,
    halfHeight = cameraViewBoxInfo.height / 2

  cameraPosition.x = center.x - halfWidth
  cameraPosition.y = center.y - halfHeight
}

watch(elementRectInfo, () => {
  if (elementRectInfo.width > elementRectInfo.height)
    resizeViewBox(
      cameraViewBoxInfo.width,
      getHeightFromWidthAndRatio(cameraViewBoxInfo.width)
    )
  else
    resizeViewBox(
      getWidthFromHeightAndRatio(cameraViewBoxInfo.height),
      cameraViewBoxInfo.height
    )

  moveCamera({ x: cameraTotalInfo.value.centerX, y: cameraTotalInfo.value.centerY })
})

function zoom(action: "In" | "Out", position: Position, count: number) {
  // TODO using position
  if (action === 'In') {
    const
      width = cameraViewBoxInfo.width * (0.7 ** count),
      height = getHeightFromWidthAndRatio(width)
    resizeViewBox(width, height)
  }
  else {
    const
      width = cameraViewBoxInfo.width * (1.3 ** count),
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

let mmPerPixel = 0

function enterPanning() {
  isPanning.value = true
  mmPerPixel = scaleInfo.value.mmPerPixel
}

function exitPanning() { isPanning.value = false }

function handleMouseUp(emitBackdrop: () => void) {
  if (hasPanned.value === false) emitBackdrop()
  hasPanned.value = false
}

function panByMouse(event: MouseEvent) {
  moveCamera({
    x: cameraTotalInfo.value.centerX - (event.movementX * mmPerPixel),
    // 📐🛑 Be careful! logic is dependent on invert
    y: cameraTotalInfo.value.centerY - ((-1) * event.movementY * mmPerPixel)
  })
  hasPanned.value = true
}

export {
  cameraPositionInfo,
  cameraViewBoxInfo,
  cameraTotalInfo,
  resizeViewBox,
  moveCamera,
  zoomIn1Time,
  zoomInOutByWheel,
  isPanning,
  enterPanning,
  exitPanning,
  panByMouse,
  handleMouseUp,
}