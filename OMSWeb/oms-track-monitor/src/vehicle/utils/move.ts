import { D } from "../../types/D";
import { Position } from "../../types/Position";
import { isPointInPathD } from "../../utils/svg/path";
import { convertToMoveTo, encodeCommandsToD, moveTo, PathCommand } from "../../utils/svg/pathSegment";

function sliceDFromSVGCommands(commands: PathCommand[], from: Position, to: Position): D {
  // from ~
  const fromIndex = commands.findIndex((command, index, commands) => {
    if (index === 0) return false

    const previousCommand = convertToMoveTo(commands[index - 1])
    const currentCommand = command

    const partD = encodeCommandsToD([previousCommand, currentCommand])
    return isPointInPathD(partD, from)
  })

  // to ~
  const toIndex = commands.findIndex((command, index, commands) => {
    if (index === 0) return false

    const previousCommand = convertToMoveTo(commands[index - 1])
    const currentCommand = command

    const partD = encodeCommandsToD([previousCommand, currentCommand])
    return isPointInPathD(partD, to)
  })

  return encodeCommandsToD([
    moveTo(from),
    ...commands.slice(fromIndex, toIndex),
    { ...commands[toIndex], x: to.x, y: to.y }
  ])
}

export { sliceDFromSVGCommands }