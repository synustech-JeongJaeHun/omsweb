import { computed, readonly } from "vue";
import { cameraViewBoxInfo } from "../map/camera";
import { elementRectInfo } from "../map/elementRect";

const scale = computed(() => ({
  mmPerPixel: cameraViewBoxInfo.width / elementRectInfo.width,
  pixelPerMm: elementRectInfo.width / cameraViewBoxInfo.width
}))

/**
 * mm means, track real unit
 */
const scaleInfo = readonly(scale)

const scaleLevel = computed(() => {
  const value = scaleInfo.value.mmPerPixel

  const scaleLevels = ["ELSE"]

  if (value < 20)
    scaleLevels.push("BELOW20")
  if (value < 15)
    scaleLevels.push("BELOW15")

  return scaleLevels.join(' ')
})

const scaleLevelInfo = readonly(scaleLevel)

export { scaleInfo, scaleLevelInfo }