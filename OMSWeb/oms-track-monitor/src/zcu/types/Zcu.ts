import { ZcuCompletePoint } from "./ZcuCompletePoint";
import { ZcuInputZone } from "./ZcuInputZone";

type Zcu = {
  id: number
  x: number
  y: number
  usingType: number
  zcuType: number
  inputZones: ZcuInputZone[]
  completePoints: ZcuCompletePoint[]
}

export { Zcu }