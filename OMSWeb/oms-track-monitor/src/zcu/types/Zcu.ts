import { ZcuCompletePoint } from "./ZcuCompletePoint";
import { ZcuInputZone } from "./ZcuInputZone";

type Zcu = {
  id: number
  x: number
  y: number
  usingType:
  | 0 // none
  | 1 // hw
  | 2 // sw
  error: boolean
  zcuType: number
  inputZones: ZcuInputZone[]
  completePoints: ZcuCompletePoint[]
}

export { Zcu }