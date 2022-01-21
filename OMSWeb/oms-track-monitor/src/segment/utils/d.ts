import { Position } from "../../types/Position";
import { arcTo, lineTo, moveTo, PathCommand, SweepFlag } from "../../utils/svg/pathSegment";
import { SegmentPart } from "../types/SegmentPart";

const
  Radius = 300,
  QuarterRoundLength = 2 * Math.PI * Radius / 4

const arcToWithRadius = (to: Position, sweepFlag: SweepFlag) => arcTo(to, Radius, sweepFlag)

function makeDFromSegment(startPos: Position, endPos: Position, parts: readonly SegmentPart[], length: number): PathCommand[] {

  const startCommand = moveTo(startPos)

  const nextCommands = (function () {
    const typePattern = parts.map(p => (p.type === 'D') ? `D` : `E${p.direction}${p.location}`).join(' ')

    switch (typePattern) {
      // Straight
      case "D": {
        return [lineTo(endPos)]
      }

      // ArcBottomLeft 1/2 right to left
      case "D EA2 D": {
        const p1 = { x: endPos.x + Radius, y: startPos.y }
        const p2 = { x: endPos.x, y: startPos.y + Radius }
        // return combineParts([{ type: 'D', to: p1 }, { type }])
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(endPos)]
      }
      // ArcBottomLeft 2/2 left to right
      case "D EC2 D": {
        const p1 = { x: startPos.x, y: endPos.y + Radius }
        const p2 = { x: startPos.x + Radius, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(endPos)]
      }
      // ArcTopLeft 1/2 right to left
      case "D EC3 D": {
        const p1 = { x: endPos.x + Radius, y: startPos.y }
        const p2 = { x: endPos.x, y: startPos.y - Radius }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(endPos)]
      }
      // ArcTopLeft 2/2 left to right
      case "D EA3 D": {
        const p1 = { x: startPos.x, y: endPos.y - Radius }
        const p2 = { x: startPos.x + Radius, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(endPos)]
      }
      // ArcBottomRight 1/2 right to left
      case "D EA1 D": {
        const p1 = { x: startPos.x, y: endPos.y + Radius }
        const p2 = { x: startPos.x - Radius, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(endPos)]
      }
      // ArcBottomRight 2/2 left to right
      case "D EC1 D": {
        const p1 = { x: endPos.x - Radius, y: startPos.y }
        const p2 = { x: endPos.x, y: startPos.y + Radius }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(endPos)]
      }
      // ArcTopRight 1/2 right to left
      case "D EC4 D": {
        const p1 = { x: startPos.x, y: endPos.y - Radius }
        const p2 = { x: startPos.x - Radius, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(endPos)]
      }
      // ArcTopRight 2/2 left to right
      case "D EA4 D": {
        const p1 = { x: endPos.x - Radius, y: startPos.y }
        const p2 = { x: endPos.x, y: startPos.y - Radius }
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(endPos)]
      }

      // SemiCircleTop 1/2  right to left
      case "D EC4 D EC3 D": {
        const deepDiff = Math.abs(endPos.y - startPos.y)
        const middleLength = Math.abs(endPos.x - startPos.x) - 2 * Radius
        const baseLength = getBaseLength(length, QuarterRoundLength, middleLength, deepDiff)
        const baseY = Math.max(startPos.y, endPos.y) + baseLength

        const p1 = { x: startPos.x, y: baseY }
        const p2 = { x: startPos.x - Radius, y: baseY + Radius }
        const p3 = { x: endPos.x + Radius, y: baseY + Radius }
        const p4 = { x: endPos.x, y: baseY }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(p3), arcToWithRadius(p4, 'Clock'), lineTo(endPos)]
      }
      // SemiCircleTop 2/2  left to right
      case "D EA3 D EA4 D": {
        const deepDiff = Math.abs(endPos.y - startPos.y)
        const middleLength = Math.abs(endPos.x - startPos.x) - 2 * Radius
        const baseLength = getBaseLength(length, QuarterRoundLength, middleLength, deepDiff)
        const baseY = Math.max(startPos.y, endPos.y) + baseLength

        const p1 = { x: startPos.x, y: baseY }
        const p2 = { x: startPos.x + Radius, y: baseY + Radius }
        const p3 = { x: endPos.x - Radius, y: baseY + Radius }
        const p4 = { x: endPos.x, y: baseY }
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(p3), arcToWithRadius(p4, 'CounterClock'), lineTo(endPos)]
      }
      // SemiCircleBottom 1/2 rigth to left
      case "D EA1 D EA2 D": {
        const deepDiff = Math.abs(endPos.y - startPos.y)
        const middleLength = Math.abs(endPos.x - startPos.x) - 2 * Radius
        const baseLength = getBaseLength(length, QuarterRoundLength, middleLength, deepDiff)
        const baseY = Math.min(startPos.y, endPos.y) - baseLength

        const p1 = { x: startPos.x, y: baseY }
        const p2 = { x: startPos.x - Radius, y: baseY - Radius }
        const p3 = { x: endPos.x + Radius, y: baseY - Radius }
        const p4 = { x: endPos.x, y: baseY }
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(p3), arcToWithRadius(p4, 'CounterClock'), lineTo(endPos)]
      }
      // SemiCircleBottom 2/2 left to right
      case "D EC2 D EC1 D": {
        const deepDiff = Math.abs(endPos.y - startPos.y)
        const middleLength = Math.abs(endPos.x - startPos.x) - 2 * Radius
        const baseLength = getBaseLength(length, QuarterRoundLength, middleLength, deepDiff)
        const baseY = Math.min(startPos.y, endPos.y) - baseLength

        const p1 = { x: startPos.x, y: baseY }
        const p2 = { x: startPos.x + Radius, y: baseY - Radius }
        const p3 = { x: endPos.x - Radius, y: baseY - Radius }
        const p4 = { x: endPos.x, y: baseY }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(p3), arcToWithRadius(p4, 'Clock'), lineTo(endPos)]
      }
      // SemiCircleLeft 1/2 bottom to top
      case "D EA2 D EA3 D": {
        const deepDiff = Math.abs(endPos.x - startPos.x)
        const middleLength = Math.abs(endPos.y - startPos.y) - 2 * Radius
        const baseLength = getBaseLength(length, QuarterRoundLength, middleLength, deepDiff)
        const baseX = Math.min(startPos.x, endPos.x) - baseLength

        const p1 = { x: baseX, y: startPos.y }
        const p2 = { x: baseX - Radius, y: startPos.y + Radius }
        const p3 = { x: baseX - Radius, y: endPos.y - Radius }
        const p4 = { x: baseX, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(p3), arcToWithRadius(p4, 'CounterClock'), lineTo(endPos)]
      }
      // SemiCircleLeft 2/2 top to bottom
      case "D EC3 D EC2 D": {
        const deepDiff = Math.abs(endPos.x - startPos.x)
        const middleLength = Math.abs(endPos.y - startPos.y) - 2 * Radius
        const baseLength = getBaseLength(length, QuarterRoundLength, middleLength, deepDiff)
        const baseX = Math.min(startPos.x, endPos.x) - baseLength

        const p1 = { x: baseX, y: startPos.y }
        const p2 = { x: baseX - Radius, y: startPos.y - Radius }
        const p3 = { x: baseX - Radius, y: endPos.y + Radius }
        const p4 = { x: baseX, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(p3), arcToWithRadius(p4, 'Clock'), lineTo(endPos)]
      }
      // SemiCircleRight 1/2 bottom to top
      case "D EC1 D EC4 D": {
        const deepDiff = Math.abs(endPos.x - startPos.x)
        const middleLength = Math.abs(endPos.y - startPos.y) - 2 * Radius
        const baseLength = getBaseLength(length, QuarterRoundLength, middleLength, deepDiff)
        const baseX = Math.max(startPos.x, endPos.x) + baseLength

        const p1 = { x: baseX, y: startPos.y }
        const p2 = { x: baseX + Radius, y: startPos.y + Radius }
        const p3 = { x: baseX + Radius, y: endPos.y - Radius }
        const p4 = { x: baseX, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(p3), arcToWithRadius(p4, 'Clock'), lineTo(endPos)]
      }
      // SemiCircleRight 2/2 top to bottom
      case "D EA4 D EA1 D": {
        const deepDiff = Math.abs(endPos.x - startPos.x)
        const middleLength = Math.abs(endPos.y - startPos.y) - 2 * Radius
        const baseLength = getBaseLength(length, QuarterRoundLength, middleLength, deepDiff)
        const baseX = Math.max(startPos.x, endPos.x) + baseLength

        const p1 = { x: baseX, y: startPos.y }
        const p2 = { x: baseX + Radius, y: startPos.y - Radius }
        const p3 = { x: baseX + Radius, y: endPos.y + Radius }
        const p4 = { x: baseX, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(p3), arcToWithRadius(p4, 'CounterClock'), lineTo(endPos)]
      }
      // SCurveHorizontal 1/4 topleft to bottomright
      case "D EC2 D EA4 D": {
        const startEndLength = Math.abs(startPos.y - endPos.y) / 2 - Radius

        const p1 = { x: startPos.x, y: startPos.y - startEndLength }
        const p2 = { x: startPos.x + Radius, y: startPos.y - startEndLength - Radius }
        const p3 = { x: endPos.x - Radius, y: endPos.y + startEndLength + Radius }
        const p4 = { x: endPos.x, y: endPos.y + startEndLength }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(p3), arcToWithRadius(p4, 'CounterClock'), lineTo(endPos)]
      }
      // SCurveHorizontal 2/4 bottomright to topleft
      case "D EC4 D EA2 D": {
        const startEndLength = Math.abs(startPos.y - endPos.y) / 2 - Radius

        const p1 = { x: startPos.x, y: startPos.y + startEndLength }
        const p2 = { x: startPos.x - Radius, y: startPos.y + startEndLength + Radius }
        const p3 = { x: endPos.x + Radius, y: endPos.y - startEndLength - Radius }
        const p4 = { x: endPos.x, y: endPos.y - startEndLength }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(p3), arcToWithRadius(p4, 'CounterClock'), lineTo(endPos)]
      }
      // SCurveHorizontal 3/4 bottomleft to topright
      case "D EA3 D EC1 D": {
        const startEndLength = Math.abs(startPos.y - endPos.y) / 2 - Radius

        const p1 = { x: startPos.x, y: startPos.y + startEndLength }
        const p2 = { x: startPos.x + Radius, y: startPos.y + startEndLength + Radius }
        const p3 = { x: endPos.x - Radius, y: endPos.y - startEndLength - Radius }
        const p4 = { x: endPos.x, y: endPos.y - startEndLength }
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(p3), arcToWithRadius(p4, 'Clock'), lineTo(endPos)]
      }
      // SCurveHorizontal 4/4 topright to bottomleft
      // here
      case "D EA1 D EC3 D": {
        const startEndLength = Math.abs(startPos.y - endPos.y) / 2 - Radius

        const p1 = { x: startPos.x, y: startPos.y - startEndLength }
        const p2 = { x: startPos.x - Radius, y: startPos.y - startEndLength - Radius }
        const p3 = { x: endPos.x + Radius, y: endPos.y + startEndLength + Radius }
        const p4 = { x: endPos.x, y: endPos.y + startEndLength }
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(p3), arcToWithRadius(p4, 'Clock'), lineTo(endPos)]
      }
      // SCurveVertical 1/4 bottomright to topleft
      case "D EA2 D EC4 D": {
        const startEndLength = Math.abs(startPos.x - endPos.x) / 2 - Radius

        const p1 = { x: startPos.x - startEndLength, y: startPos.y }
        const p2 = { x: startPos.x - startEndLength - Radius, y: startPos.y + Radius }
        const p3 = { x: endPos.x + startEndLength + Radius, y: endPos.y - Radius }
        const p4 = { x: endPos.x + startEndLength, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(p3), arcToWithRadius(p4, 'Clock'), lineTo(endPos)]
      }
      // SCurveVertical 2/4 topleft to bottomright
      case "D EA4 D EC2 D": {
        const startEndLength = Math.abs(startPos.x - endPos.x) / 2 - Radius

        const p1 = { x: startPos.x + startEndLength, y: startPos.y }
        const p2 = { x: startPos.x + startEndLength + Radius, y: startPos.y - Radius }
        const p3 = { x: endPos.x - startEndLength - Radius, y: endPos.y + Radius }
        const p4 = { x: endPos.x - startEndLength, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'CounterClock'), lineTo(p3), arcToWithRadius(p4, 'Clock'), lineTo(endPos)]
      }
      // SCurveVertical 3/4 topright to bottomleft
      case "D EC3 D EA1 D": {
        const startEndLength = Math.abs(startPos.x - endPos.x) / 2 - Radius

        const p1 = { x: startPos.x - startEndLength, y: startPos.y }
        const p2 = { x: startPos.x - startEndLength - Radius, y: startPos.y - Radius }
        const p3 = { x: endPos.x + startEndLength + Radius, y: endPos.y + Radius }
        const p4 = { x: endPos.x + startEndLength, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(p3), arcToWithRadius(p4, 'CounterClock'), lineTo(endPos)]
      }
      // SCurveVertical 4/4 bottomleft to topright
      case "D EC1 D EA3 D": {
        const startEndLength = Math.abs(startPos.x - endPos.x) / 2 - Radius

        const p1 = { x: startPos.x + startEndLength, y: startPos.y }
        const p2 = { x: startPos.x + startEndLength + Radius, y: startPos.y + Radius }
        const p3 = { x: endPos.x - startEndLength - Radius, y: endPos.y - Radius }
        const p4 = { x: endPos.x - startEndLength, y: endPos.y }
        return [lineTo(p1), arcToWithRadius(p2, 'Clock'), lineTo(p3), arcToWithRadius(p4, 'CounterClock'), lineTo(endPos)]
      }

      default: {
        return [startCommand]
      }
    }
  })()

  return [startCommand, ...nextCommands]
}


function getBaseLength(length: number, quarterRoundLength: number, middleLength: number, deepDiff: number) {
  return (length - (2 * quarterRoundLength) - middleLength - deepDiff) / 2
}

export { makeDFromSegment }