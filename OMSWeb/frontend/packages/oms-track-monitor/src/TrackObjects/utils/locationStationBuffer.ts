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

function getPositionForBufferOrStation(
	bufferOrStation: Buffer | Station,
	margin: number
) {
	const segment = findSegmentByPoints(
		bufferOrStation.pointId,
		bufferOrStation.nextPoint
	)

	if (segment === undefined) return undefined

	const segmentPath = createPathElement(segment.d)

  const leng =segmentPath.getTotalLength();
  const gap = leng < bufferOrStation.offset ? bufferOrStation.offset-leng : 0

	const backwardPosition = segmentPath.getPointAtLength(
		bufferOrStation.offset - 40 - gap
	)
	const forwardPosition = segmentPath.getPointAtLength(
		bufferOrStation.offset + 40 + gap
	)

	const offsetPosition = segmentPath.getPointAtLength(
		bufferOrStation.offset - gap
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

	const directionTransformVector = multipleVector(orthogonalVector, margin)
  const position = addVectors(offsetPosition, directionTransformVector)

  if(gap>0){
    if(offsetVector.x!==0) position.x+=gap
    if(offsetVector.y!==0) position.y+=gap
  }
	return { x: Math.ceil(position.x), y: Math.ceil(position.y) }
}

function getPositionForBufferOfStationOffsetPosition(
	bufferOrStation: Buffer | Station
) {
	const segment = findSegmentByPoints(
		bufferOrStation.pointId,
		bufferOrStation.nextPoint
	)
	if (segment === undefined) return undefined

	const segmentPath = createPathElement(segment.d)
	const offsetPosition = segmentPath.getPointAtLength(
		bufferOrStation.offset
	)
	return offsetPosition
}

export {
	getPositionForBufferOrStation,
	getPositionForBufferOfStationOffsetPosition,
}
