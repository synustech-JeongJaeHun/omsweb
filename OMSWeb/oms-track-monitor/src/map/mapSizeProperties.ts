import { reactive } from "vue";
import { MapSizeProperties } from "./types/MapSizeProperties"

const mapSizeProperties = reactive<MapSizeProperties>({
  width: 0,
  height: 0,
  minX: 0,
  minY: 0,
  maxX: 1000,
  maxY: 1000,
})

export { mapSizeProperties }