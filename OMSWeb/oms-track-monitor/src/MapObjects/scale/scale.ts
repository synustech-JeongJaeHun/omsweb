import { computed, readonly, Ref } from "vue";
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
  if (value < 17)
    return "BELOW17"
  if (value < 20)
    return "BELOW20"
  else
    return "ELSE"
})

const scaleLevelInfo = readonly(scaleLevel)

// function useScreenFixedScale(fixedScale: Ref<number>, threshold: number) {
//   const dynamicSizeInSvg = computed(() => {
//     const calculated = fixedScale.value / scaleInfo.value.pixelPerMm
//     return calculated < threshold ? threshold : calculated
//   })
//   return dynamicSizeInSvg
// }

export { scaleInfo, scaleLevelInfo }