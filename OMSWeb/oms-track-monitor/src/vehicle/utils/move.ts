import { encodeSVGPath, SVGPathData } from "svg-pathdata";
import { SVGCommand } from "svg-pathdata/lib/types";
import { D } from "../../types/D";
import { Position } from "../../types/Position";
import { isPointInPathD } from "../../utils/path";

function sliceDFromSVGCommands(commands: SVGCommand[], from: Position, to: Position): D {
  // from ~
  const fromIndex = commands.findIndex((command, index, commands) => {
    if (index === 0) return false

    const previousCommand = commands[index - 1]
    previousCommand.type = SVGPathData.MOVE_TO
    const currentCommand = command

    const partD = encodeSVGPath([previousCommand, currentCommand])
    return isPointInPathD(partD, from)
  })

  // to ~
  const toIndex = commands.findIndex((command, index, commands) => {
    if (index === 0) return false

    const previousCommand = commands[index - 1]
    previousCommand.type = SVGPathData.MOVE_TO
    const currentCommand = command

    const partD = encodeSVGPath([previousCommand, currentCommand])
    return isPointInPathD(partD, to)
  })

  const d = encodeSVGPath([
    { relative: false, type: SVGPathData.MOVE_TO, ...from },
    ...commands.slice(fromIndex, toIndex),
    {
      ...commands[toIndex], x: to.x,
      // @ts-ignore
      y: to.y,
    }])

  return d
}

export { sliceDFromSVGCommands }