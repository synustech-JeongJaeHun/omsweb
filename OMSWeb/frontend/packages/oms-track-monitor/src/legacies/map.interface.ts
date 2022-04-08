import { ICoordinate } from './models/drawing.model'

interface ICoordinateInfo {
  coord: ICoordinate
  invertedCoord?: ICoordinate
  isError?: boolean
}
interface ISegmentSummary {
  type: string
  location: string
  direction: string
}
interface ISegmentPart {
  id?: number
  radius?: number
  type?: string
  direction?: string
  location?: string
  coordFrom: ICoordinateInfo
  coordTo: ICoordinateInfo
  path?: string
}

interface ISegmentPath {
  id: number
  path: string
  pointFrom: IPoint
  pointTo: IPoint
  type: string
}
interface ISegment extends ISegmentPath {
  logicalId: string
  physicalId: string
  location: string
  direction: string

  segmentParts: ISegmentPart[]
  dirCoord: any
  dirAngle: any
  bezierPoints: any[]

  length: number
  speed?: number
  travelTime?: number

  disableState?: any

  candidates?: any[]
  isValidate?: boolean
  validateText?: string
  updateState?: string
}

interface IPoint {
  id?: number
  coord: ICoordinate
  invertedCoord: ICoordinate
}

export { ISegmentSummary, ISegmentPart, ISegment, IPoint }
