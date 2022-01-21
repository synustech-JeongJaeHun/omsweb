import { D } from "../../types/D"
import { Position } from "../../types/Position"

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
  }
}

function encodeCommandsToD(commands: PathCommand[]): D {
  return commands.map(command => toD(command)).join(' ')
}

export {
  PathCommand,
  SweepFlag,
  moveTo,
  lineTo,
  arcTo,
  convertToMoveTo,
  encodeCommandsToD
}