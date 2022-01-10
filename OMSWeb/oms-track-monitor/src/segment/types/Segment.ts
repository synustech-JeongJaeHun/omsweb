import { SegmentPart } from "./SegmentPart";

type Segment = {
  id: number
  logicalId: string
  physicalId?: string

  startPoint: number
  endPoint: number
  length: number
  speed: number

  segpartId: number

  // nullable
  segparts?: SegmentPart[]
  candidates?: any[]
  travelTime: any
  isValidate?: boolean
}

export { Segment }