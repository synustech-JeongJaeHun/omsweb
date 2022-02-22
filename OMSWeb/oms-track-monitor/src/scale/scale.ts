import { computed, readonly, Ref } from "vue";
import { cameraInfo } from "../map/camera";
import { elementRectInfo } from "../map/elementRect";

const scale = computed(() => ({
  mmPerPixel: cameraInfo.value.viewBoxWidth / elementRectInfo.width,
  pixelPerMm: elementRectInfo.width / cameraInfo.value.viewBoxWidth
}))

const scaleInfo = readonly(scale)

function useScreenFixedScale(scale: Ref<number>, threshold: number) {
  const dynamicSizeInSvg = computed(() => {
    const calculated = scale.value / scaleInfo.value.pixelPerMm
    return calculated < threshold ? threshold : calculated
  })
  return dynamicSizeInSvg
}

export { scaleInfo, useScreenFixedScale }