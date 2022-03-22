import { Buffer } from '../buffer/types/Buffer'
import { Station } from '../station/types/Station'
import {
  addVectors,
  getOrthogonalVector,
  getUnitVector,
  multipleVector,
  ZeroVector,
} from '../../utils/vector'
import { findSegmentByPoints } from '../segment/segments'
import { createPathElement } from 'src/utils/svg/path'

const DirectionMargin = 500

function getPositionForBufferOrStation(bufferOrStation: Buffer | Station) {
  const segment = findSegmentByPoints(
    bufferOrStation.pointId,
    bufferOrStation.nextPoint
  )

  if (segment === undefined) return undefined

  const segmentPath = createPathElement(segment.d)

  const backwardPosition = segmentPath.getPointAtLength(
    bufferOrStation.offset - 40
  )
  const forwardPosition = segmentPath.getPointAtLength(
    bufferOrStation.offset + 40
  )

  const offsetPosition = segmentPath.getPointAtLength(
    bufferOrStation.offset
  )
  const offsetVector = addVectors(
    forwardPosition,
    multipleVector(backwardPosition, -1)
  )
  const unitVector = getUnitVector(offsetVector)

  const orthogonalVector =
    bufferOrStation.direction === 'L'
      ? getOrthogonalVector(unitVector, 'counterclockwise')
      : bufferOrStation.direction === 'R'
      ? getOrthogonalVector(unitVector, 'clockwise')
      : ZeroVector

  const directionTransformVector = multipleVector(
    orthogonalVector,
    DirectionMargin
  )
  const position = addVectors(offsetPosition, directionTransformVector)

  return { x: Math.ceil(position.x), y: Math.ceil(position.y) }
}

export { getPositionForBufferOrStation }
