import { Buffer } from "../buffer/types/Buffer"
import { findPointById } from "../point/points"
import { Station } from "../station/types/Station"
import { addVectors, getOrthogonalVector, getUnitVector, multipleVector, ZeroVector } from "./vector"

const DirectionMargin = 500

function getPositionForBufferOrStation(bufferOrStation: Buffer | Station) {
  const
    startPointPosition = findPointById(bufferOrStation.pointId),
    nextPointPosition = findPointById(bufferOrStation.nextPoint)

  if (startPointPosition === undefined || nextPointPosition === undefined)
    return undefined

  const unitVector = getUnitVector({
    x: nextPointPosition.x - startPointPosition.x,
    y: nextPointPosition.y - startPointPosition.y
  })

  const offsetVector = multipleVector(unitVector, bufferOrStation.offset)
  const offsetPosition = addVectors({ x: startPointPosition.x, y: startPointPosition.y }, offsetVector)

  const orthogonalVector =
    bufferOrStation.direction === 'L' ? getOrthogonalVector(unitVector, 'counterclockwise')
      : bufferOrStation.direction === 'R' ? getOrthogonalVector(unitVector, 'clockwise')
        : ZeroVector

  const directionTransformVector = multipleVector(orthogonalVector, DirectionMargin)
  const position = addVectors(offsetPosition, directionTransformVector)

  return { x: Math.ceil(position.x), y: Math.ceil(position.y) }
}

export { getPositionForBufferOrStation }