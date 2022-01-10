import { computed, reactive, readonly } from "vue";
import { Camera } from "./types/Camera";

const
  DefaultWidth = 1000,
  DefaultHeight = 1000

const camera = reactive<Camera>({
  x: 0,
  y: 0,
  width: DefaultWidth,
  height: DefaultHeight,
})

const center = computed(() => {
  const
    x = camera.x + (camera.width / 2),
    y = camera.y + (camera.height / 2)
  return { x, y }
})

const cameraInfo = readonly(computed(() => ({
  x: camera.x,
  y: camera.y,
  width: camera.width,
  height: camera.height,
  widthPx: `${camera.width}px`,
  heightPx: `${camera.height}px`,
  viewBox: `${camera.x} ${camera.y} ${camera.width} ${camera.height}`,
})))

function resizeCamera(width: number, height: number) {
  camera.x = center.value.x - (width / 2)
  camera.y = center.value.y - (height / 2)
  camera.width = width
  camera.height = height
}
function zoomIn(event: MouseEvent) { }
function zoomOut(event: MouseEvent) { }
function pan(event: MouseEvent) { }

export { cameraInfo, resizeCamera }