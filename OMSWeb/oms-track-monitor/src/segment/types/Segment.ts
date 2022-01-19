import { D } from "../../types/D";
import { SegmentPart } from "./SegmentPart";

type Segment = {
  id: number
  logicalId: string
  physicalId?: string

  startPoint: number
  endPoint: number
  length: number
  speed: number

  disabled: boolean

  parts: SegmentPart[]

  d: D
}

export { Segment }