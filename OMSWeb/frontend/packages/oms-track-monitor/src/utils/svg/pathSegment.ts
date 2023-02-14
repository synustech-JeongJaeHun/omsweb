import { D } from "../../types/D"
import { Position } from "../../types/Position"
import { getUnitVector } from "../vector"
// type

type PathCommand = MoveTo | LineTo | ArcTo

type MoveTo = {
  type: "MoveTo",
  x: number,
  y: number,
}

type LineTo = {
  type: 'LineTo',
  x: number,
  y: number,
}

type ArcTo = {
  type: 'ArcTo',
  rx: number,
  ry: number,
  xAxisRotation: 0, // FIXED
  largeArcFlag: 0, // FIXED
  sweepFlag: 0 | 1,
  x: number,
  y: number,
}

// constructor

function moveTo(to: Position): MoveTo {
  return {
    type: 'MoveTo',
    x: to.x,
    y: to.y
  }
}
function lineTo(to: Position): LineTo {
  return {
    type: 'LineTo',
    x: to.x,
    y: to.y
  }
}

// https://developer.mozilla.org/ko/docs/Web/SVG/Tutorial/Paths#arcs
type SweepFlag = "Clock" | "CounterClock"
function arcTo(to: Position, radius: number, sweepFlag: SweepFlag): ArcTo {
  return {
    type: "ArcTo",
    rx: radius,
    ry: radius,
    xAxisRotation: 0,
    largeArcFlag: 0,
    sweepFlag: sweepFlag === 'CounterClock' ? 0 : 1,
    x: to.x,
    y: to.y
  }
}

// util

function convertToMoveTo(c: PathCommand): MoveTo {
  switch (c.type) {
    case "MoveTo":
    case "LineTo":
    case "ArcTo":
      return {
        type: 'MoveTo',
        x: c.x,
        y: c.y
      }
    default:
      throw new Error(JSON.stringify(c));
  }
}

function toD(c: PathCommand): D {
  switch (c.type) {
    case "MoveTo":
      return `M ${c.x} ${c.y}`;
    case "LineTo":
      return `L ${c.x} ${c.y}`;
    case "ArcTo":
      return `A ${c.rx} ${c.ry} ${c.xAxisRotation} ${c.largeArcFlag} ${c.sweepFlag} ${c.x} ${c.y}`;
    default:
      throw new Error(JSON.stringify(c))
  }
}

function encodeCommandsToD(commands: PathCommand[]): D {
  return commands.map((command) => toD(command)).join(' ')
}

function isPointIn(type: "Straight" | "Curve", from: Position, to: Position, point: Position): boolean {
  // point at from or to
  const
    isPointInFrom = from.x === point.x && from.y === point.y,
    isPointInTo = to.x === point.x && to.y === point.y
  if (isPointInFrom || isPointInTo)
    return true


  // point between from and to
  if (type === 'Straight') {
    const vectorFromLine = getUnitVector({ x: to.x - from.x, y: to.y - from.y })
    const vectorFromPoint = getUnitVector({ x: to.x - point.x, y: to.y - point.y })

    return (vectorFromLine.x === vectorFromPoint.x || vectorFromLine.y === vectorFromPoint.y)
  }

  // Curve
  const
    minX = Math.min(from.x, to.x),
    maxX = Math.max(from.x, to.x),
    minY = Math.min(from.y, to.y),
    maxY = Math.max(from.y, to.y)

  return (
    (minX < point.x && point.x < maxX)
    && (minY < point.y && point.y < maxY)
  )
}

function slicePathCommands(commands: readonly PathCommand[], from: Position, to: Position): PathCommand[] {
  // from ~
  const fromIndex = commands.findIndex((command, index, commands) => {
    if (index === 0) return false
    return isPointIn(command.type === 'ArcTo' ? 'Curve' : 'Straight', commands[index - 1], command, from)
  })

  // to ~
  const toIndex = commands.findIndex((command, index, commands) => {
    if (index === 0) return false
    return isPointIn(command.type === 'ArcTo' ? 'Curve' : 'Straight', commands[index - 1], command, to)
  })

  // bug fix : toIndex === -1 case
  // -> change -1 to commands.length-1 or 0
  const fromIdx= fromIndex===-1? 0:fromIndex;
  const toIdx= toIndex===-1?commands.length-1:toIndex;

  return [
    moveTo(from),
    ...commands.slice(fromIdx, toIdx),
    { ...commands[toIdx], x: to.x, y: to.y }
  ]
}

export {
  PathCommand,
  SweepFlag,
  moveTo,
  lineTo,
  arcTo,
  convertToMoveTo,
  encodeCommandsToD,
  isPointIn,
  slicePathCommands
}
