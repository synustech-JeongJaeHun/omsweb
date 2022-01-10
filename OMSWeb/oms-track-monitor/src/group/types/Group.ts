type Group = {
  id: number
  logicalId: string
  color: string
  objects: { id: number, type: "vehicle" | "station" | "buffer" | "mtl" | "home" }[]
}

export { Group }