import { computed, readonly, Ref } from "vue";
import { cameraViewBoxInfo } from "../map/camera";
import { elementRectInfo } from "../map/elementRect";

const scale = computed(() => ({
  mmPerPixel: cameraViewBoxInfo.width / elementRectInfo.width,
  pixelPerMm: elementRectInfo.width / cameraViewBoxInfo.width
}))

const scaleInfo = readonly(scale)

function useScreenFixedScale(fixedScale: Ref<number>, threshold: number) {
  const dynamicSizeInSvg = computed(() => {
    const calculated = fixedScale.value / scaleInfo.value.pixelPerMm
    return calculated < threshold ? threshold : calculated
  })
  return dynamicSizeInSvg
}

export { scaleInfo, useScreenFixedScale }