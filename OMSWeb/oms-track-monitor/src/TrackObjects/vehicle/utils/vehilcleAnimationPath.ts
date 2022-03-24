import { Segment } from 'src/TrackObjects/segment/types/Segment'
import { Position } from 'src/types/Position'
import {
  encodeCommandsToD,
  slicePathCommands,
} from 'src/utils/svg/pathSegment'
import { UpdateType } from '../types/Vehicle'

function makeVehicleAnimationPath(
  updateType: Omit<UpdateType, 'NoAnimation'>,
  beforeSegment: Segment,
  currentSegment: Segment,
  beforePosition: Position,
  currentPosition: Position
) {
  const pathCommands = (function () {
    if (updateType === 'AnimationIn2Segments') {
      const concatenatedCommands = [
        ...beforeSegment.pathCommands,
        ...currentSegment.pathCommands.slice(1),
      ]
      return slicePathCommands(
        concatenatedCommands,
        beforePosition,
        currentPosition!
      )
    } else updateType === 'AnimationIn1Segment'
    return slicePathCommands(
      beforeSegment.pathCommands,
      beforePosition,
      currentPosition!
    )
  })()

  return encodeCommandsToD(pathCommands)
}

export { makeVehicleAnimationPath }
