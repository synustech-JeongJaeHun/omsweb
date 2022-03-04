import { Segment } from "src/TrackObjects/segment/types/Segment"
import { Position } from "src/types/Position"
import { encodeCommandsToD, moveTo, slicePathCommands } from "src/utils/svg/pathSegment"
import { Vehicle } from "../../types/Vehicle"

type Arguments = {
  updateType?: Vehicle['updateType'],
  lastUpdated?: number,
  currentSegment?: Segment
  beforeSegment?: Segment
  beforePosition?: Position,
  currentPosition: Position,
}

function makeDInUpdate(event: MessageEvent<Arguments>) {
  const args = event.data
  const pathCommands = (function () {
    if (args.updateType === 'AnimationIn2Segments' && args.currentSegment && args.beforeSegment && args.beforePosition) {
      const concatenatedCommands = [
        ...args.beforeSegment.pathCommands,
        ...args.currentSegment.pathCommands.slice(1)
      ]
      return slicePathCommands(concatenatedCommands, args.beforePosition, args.currentPosition)
    }

    if (args.updateType === 'AnimationIn1Segment' && args.beforeSegment && args.beforePosition)
      return slicePathCommands(args.beforeSegment.pathCommands, args.beforePosition, args.currentPosition)

    const currentPositionPathCommands = [moveTo(args.currentPosition)]
    if (args.updateType === 'NoAnimation')
      return currentPositionPathCommands

    return currentPositionPathCommands
  })()

  postMessage({ d: encodeCommandsToD(pathCommands), lastUpdate: args.lastUpdated })
}

// https://developer.mozilla.org/ko/docs/Web/API/Web_Workers_API/Using_web_workers
onmessage = makeDInUpdate