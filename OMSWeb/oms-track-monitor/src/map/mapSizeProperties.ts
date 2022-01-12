import { computed, reactive, readonly, watchEffect } from "vue";

const mapSizeProperties = reactive({
  minX: 0,
  minY: 0,
  maxX: 1000,
  maxY: 1000,
})

function initMapSizeProperties(minX: number, minY: number, maxX: number, maxY: number) {
  mapSizeProperties.minX = minX
  mapSizeProperties.minY = minY
  mapSizeProperties.maxX = maxX
  mapSizeProperties.maxY = maxY
}

const mapSizePropertiesInfo = readonly(computed(() => ({
  ...mapSizeProperties,
  centerX: (mapSizeProperties.maxX + mapSizeProperties.minX) / 2,
  centerY: (mapSizeProperties.maxY + mapSizeProperties.minY) / 2,
  width: mapSizeProperties.maxX - mapSizeProperties.minX,
  height: mapSizeProperties.maxY - mapSizeProperties.minY,
})))

watchEffect(() => console.log("checkthis"
  , mapSizePropertiesInfo.value.minX
  , mapSizePropertiesInfo.value.minY
  , mapSizePropertiesInfo.value.maxX
  , mapSizePropertiesInfo.value.maxY
  , mapSizePropertiesInfo.value.width
  , mapSizePropertiesInfo.value.height
))

export { initMapSizeProperties, mapSizePropertiesInfo }