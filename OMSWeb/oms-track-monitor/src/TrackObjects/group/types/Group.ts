import { Color } from "src/types/Color"

type ObjectInGroupType =
  | "vehicle" | "station" | "buffer" | "mtl" | "home"

type Group = {
  id: number
  logicalId: string
  color: keyof typeof Color
  objects: { id: number, type: ObjectInGroupType }[]
}

export { ObjectInGroupType, Group }