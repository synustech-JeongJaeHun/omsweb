import { CanBeFocused } from 'src/MapObjects/focus/types/CanBeFocused'
import { D } from '../../../types/D'
import { PathCommand } from '../../../utils/svg/pathSegment'
import { SegmentPart } from './SegmentPart'

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

  pathCommands: PathCommand[]
  d: D

  disabledByMtl?: boolean
  disabledByOnlyVehicle?: boolean
  z?: number
  type?: string
  color?: string|undefined
} & CanBeFocused

export { Segment }
