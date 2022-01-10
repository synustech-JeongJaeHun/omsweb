import { ISegment as ISegmentInTrack } from './track.model'
import {
  IPoint,
  ISegment,
  ISegmentPart,
  // , ISegmentSummary
} from '../map.interface'

class Segment implements ISegment {
  objectType = 'Segment'
  id: number
  logicalId: string
  physicalId: string
  pointFrom: IPoint
  pointTo: IPoint
  type: string
  location: string
  direction: string

  segmentParts: ISegmentPart[] = []
  path = ''
  dirCoord: any
  dirAngle: any
  bezierPoints = []

  length: number
  speed?: number
  travelTime?: number

  disableState?: any

  candidates?= []
  isValidate?: boolean
  validateText?: string
  updateState?: string

  constructor(
    row: ISegmentInTrack,
    updateState: string,
    fromPoint: IPoint,
    toPoint: IPoint
  ) {
    const {
      id,
      type,
      logicalId,
      physicalId,
      location,
      direction,
      length,
      speed,
      travelTime,
      isValidate,
      candidates,
    } = row
    this.id = id
    this.physicalId = physicalId!
    this.logicalId = logicalId
    this.pointFrom = {
      id: fromPoint.id,
      coord: fromPoint.coord,
      invertedCoord: fromPoint.invertedCoord,
    }
    this.pointTo = {
      id: toPoint.id,
      coord: toPoint.coord,
      invertedCoord: toPoint.invertedCoord,
    }
    // @ts-ignore
    this.type = type
    // @ts-ignore
    this.location = location
    // @ts-ignore
    this.direction = direction
    this.travelTime = travelTime
    this.isValidate = isValidate
    this.updateState = updateState

    // @ts-ignore
    this.candidates = candidates

    this.length = length
    this.speed = speed
  }
}

export { Segment }
