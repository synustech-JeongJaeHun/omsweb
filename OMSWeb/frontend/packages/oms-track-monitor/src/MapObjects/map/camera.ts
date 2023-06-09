import { Position } from 'src/types/Position'
import { computed, reactive, readonly, ref } from 'vue'
import { scaleInfo } from '../scale/scale'
import { CameraDefaultRect } from './default'
import { elementRectInfo, getHeightFromWidthAndRatio } from './elementRect'

const cameraPosition = reactive({
  x: 0,
  y: 0,
})
const cameraPositionInfo = readonly(cameraPosition)

const cameraViewBox = reactive({
  width: CameraDefaultRect.width,
  height: CameraDefaultRect.height,
})
const cameraViewBoxInfo = readonly(cameraViewBox)

const cameraTotalInfo = readonly(
  computed(() => ({
    x: cameraPositionInfo.x,
    y: cameraPositionInfo.y,
    viewBoxWidth: cameraViewBoxInfo.width,
    viewBoxHeight: cameraViewBoxInfo.height,
    centerX: cameraPositionInfo.x + cameraViewBoxInfo.width / 2,
    centerY: cameraPositionInfo.y + cameraViewBoxInfo.height / 2,
    maxX: cameraPositionInfo.x + cameraViewBoxInfo.width,
    maxY: cameraPositionInfo.x + cameraViewBoxInfo.height,
    viewBox: `${Math.ceil(cameraPositionInfo.x)} ${Math.ceil(
      cameraPositionInfo.y
    )} ${Math.ceil(cameraViewBoxInfo.width)} ${Math.ceil(
      cameraViewBoxInfo.height
    )}`,
  }))
)

// todo merge
let previousTouch: Touch | null =({} as any) as Touch;
let previousTouchList: TouchList | null;

function resizeViewBox(width: number, height: number) {
  cameraPosition.x = cameraTotalInfo.value.centerX - width / 2
  cameraPosition.y = cameraTotalInfo.value.centerY - height / 2
  cameraViewBox.width = width
  cameraViewBox.height = height
}

function moveCamera(center: Position) {
  const halfWidth = cameraViewBoxInfo.width / 2,
    halfHeight = cameraViewBoxInfo.height / 2

  cameraPosition.x = center.x - halfWidth
  cameraPosition.y = center.y - halfHeight
}

function getZoomRatio(action: 'In' | 'Out') {
  return action === 'In' ? 0.7 : 1.3
}

function zoom(
  action: 'In' | 'Out',
  offset: { x: MouseEvent['offsetX']; y: MouseEvent['offsetY'] },
  count: number
) {
  // 📐🛑 Be careful! logic is dependent on invert
  const invertedOffsetY = elementRectInfo.height - offset.y

  const cursorPosition = {
    x: cameraPositionInfo.x + offset.x * scaleInfo.value.mmPerPixel,
    y: cameraPositionInfo.y + invertedOffsetY * scaleInfo.value.mmPerPixel,
  }

  let w = cameraViewBoxInfo.width * getZoomRatio(action) ** count
  if(w > 300000){
    w = 300000
  }
  if(w < 1000){
    w= 1000
  }

  const width = w,
    height = getHeightFromWidthAndRatio(w)

  const centerX =
      cursorPosition.x -
      (width / elementRectInfo.width) * offset.x +
      width / 2,
    centerY =
      cursorPosition.y -
      (height / elementRectInfo.height) * invertedOffsetY +
      height / 2

  resizeViewBox(width, height)
  moveCamera({ x: centerX, y: centerY })
}
// element event listener

function zoomIn1Time(event: MouseEvent) {
  zoom('In', { x: event.offsetX, y: event.offsetY }, 1)
}

function zoomByButton(type :'In' | 'Out' ='In') {
  const x =elementRectInfo.width/2,
        y= elementRectInfo.height/2

  zoom(type, { x, y }, 1)
}

const MaximumZoomCount = 3
let zoomCount = 0
let zoomAction: 'Out' | 'In' | undefined = undefined
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
      zoom(
        action,
        { x: event.offsetX, y: event.offsetY },
        zoomCount > MaximumZoomCount ? MaximumZoomCount : zoomCount
      )
      zoomCount = 0
      zoomAction = undefined
      zoomDebounceTimeoutId = undefined
    }, 55)
  }
}

const isPanning = ref(false),
  hasPanned = ref(false)

let mmPerPixel = 0

function enterPanning() {
  isPanning.value = true
  mmPerPixel = scaleInfo.value.mmPerPixel
}

function exitPanning() {
  isPanning.value = false
  previousTouch = null;
  previousTouchList = null;
}

function handleMouseUp(emitBackdrop: () => void) {
  if (hasPanned.value === false) emitBackdrop()
  hasPanned.value = false
}

function panByMouse(event: MouseEvent) {
  moveCamera({
    x: cameraTotalInfo.value.centerX - event.movementX * mmPerPixel,
    // 📐🛑 Be careful! logic is dependent on invert
    y: cameraTotalInfo.value.centerY - -1 * event.movementY * mmPerPixel,
  })
  hasPanned.value = true
}

function touchByMouse(event: TouchEvent){
  event.preventDefault();
  event.touches.length < 2 ?  singleTouch(event) : zoomInTouch(event);
}

function singleTouch(event: TouchEvent){
  const touch = event.touches[0];
    if (previousTouch?.pageX || previousTouch?.pageY) {
        moveCamera({
          x : cameraTotalInfo.value.centerX - (touch.pageX - previousTouch.pageX)* mmPerPixel,
          y : cameraTotalInfo.value.centerY - -1 * (touch.pageY - previousTouch.pageY)* mmPerPixel
        })
    };

    previousTouch = touch;
    hasPanned.value = true
}

function startTouch(event: TouchEvent){
  if (event.touches.length === 2) {
    previousTouchList = event.touches;
  }
}

const TouchMaximumZoomCount = 2
function zoomInTouch(event: TouchEvent){
  const x = event.touches[0].clientX;
  const y = event.touches[0].clientY;

  if(previousTouchList){
    const prevDist = Math.hypot(
      previousTouchList[1].pageX - previousTouchList[0].pageX,
      previousTouchList[1].pageY - previousTouchList[0].pageY);
    const dist = Math.hypot(
      event.touches[1].pageX - event.touches[0].pageX,
      event.touches[1].pageY - event.touches[0].pageY);

    const action = prevDist > dist ? 'Out' : 'In'

    if (zoomCount === 0) zoomAction = action

    if (zoomAction === action) {
      if (zoomCount > TouchMaximumZoomCount && zoomDebounceTimeoutId) return

      clearTimeout(zoomDebounceTimeoutId)
      zoomCount += 0.3

      // @ts-ignore
      zoomDebounceTimeoutId = setTimeout(() => {
        zoom(
          action,
          { x, y },
          zoomCount > TouchMaximumZoomCount ? TouchMaximumZoomCount : zoomCount
        )
        zoomCount = 0
        zoomAction = undefined
        zoomDebounceTimeoutId = undefined
        previousTouchList = event.touches
      }, 10)
    }
  }

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
  zoomByButton,
  touchByMouse,
  startTouch
}
