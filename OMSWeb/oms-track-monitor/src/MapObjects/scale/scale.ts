import { computed, readonly } from 'vue'
import { cameraViewBoxInfo } from '../map/camera'
import { elementRectInfo } from '../map/elementRect'

const BreakPoints = [20, 15, 13, 11, 9, 7, 5]

const scale = computed(() => ({
  mmPerPixel: cameraViewBoxInfo.width / elementRectInfo.width,
  pixelPerMm: elementRectInfo.width / cameraViewBoxInfo.width,
}))

/**
 * mm means, track real unit
 */
const scaleInfo = readonly(scale)

const scaleLevel = computed(() =>
  [
    'ELSE',
    ...BreakPoints.filter((n) => scaleInfo.value.mmPerPixel < n).map(
      (n) => `BELOW${n}`
    ),
  ].join(' ')
)

const scaleLevelInfo = readonly(scaleLevel)

export { scaleInfo, scaleLevelInfo }
