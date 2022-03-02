import { Segment } from "src/TrackObjects/segment/types/Segment"
import { Position } from "src/types/Position"
import { moveTo, slicePathCommands } from "src/utils/svg/pathSegment"
import { Vehicle } from "../../types/Vehicle"

type Arguments = {
  updateType?: Vehicle['updateType'],
  currentSegment?: Segment
  beforeSegment?: Segment
  beforePosition: Position,
  currentPosition: Position,
}

function makePathCommandsInUpdate(event: MessageEvent<Arguments>) {
  const args = event.data

  if (args.updateType === 'AnimationIn2Segments' && args.currentSegment && args.beforeSegment) {
    const concatenatedCommands = [
      ...args.beforeSegment.pathCommands,
      ...args.currentSegment.pathCommands.slice(1)
    ]
    return slicePathCommands(concatenatedCommands, args.beforePosition, args.currentPosition)
  }

  if (args.updateType === 'AnimationIn1Segment' && args.beforeSegment)
    return slicePathCommands(args.beforeSegment.pathCommands, args.beforePosition, args.currentPosition)

  const currentPositionPathCommands = [moveTo(args.currentPosition)]
  if (args.updateType === 'NoAnimation')
    return currentPositionPathCommands

  return currentPositionPathCommands
}

onmessage = makePathCommandsInUpdate