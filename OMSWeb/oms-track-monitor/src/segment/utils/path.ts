import { computed, readonly, Ref } from "vue";
import { usePointPoisiton } from "../../point/points";
import { Segment } from "../types/Segment";
import { CurveDirection, Quadrant, SegmentPart } from "../types/SegmentPart";

const
  Radius = 300,
  QuarterRoundLength = 2 * Math.PI * Radius / 4

function usePath(segment: Ref<Segment>) {
  const startPointPosition = usePointPoisiton(computed(() => segment.value.startPoint))
  const nextPointPosition = usePointPoisiton(computed(() => segment.value.endPoint))
  const path = computed(() => makePathFromSegment(startPointPosition.value, nextPointPosition.value, segment.value.parts, segment.value.length))

  return readonly(path)
}

type Position = { x: number, y: number }
type Path = string
function makePathFromSegment(startPos: Position, endPos: Position, parts: SegmentPart[], length: number): Path {

  const startCommand = `M ${startPos.x} ${startPos.y}`


  const nextCommands = (function () {
    const typePattern = parts.map(p => (p.type === 'D') ? `D` : `E${p.direction}${p.location}`).join(' ')

    switch (typePattern) {
      // Straight
      case "D": {
        return [`L ${endPos.x} ${endPos.y}`]
      }

      // ArcBottomLeft 1/2 right to left
      case "D EA2 D": {
        const p1 = { x: endPos.x + Radius, y: startPos.y }
        const p2 = { x: endPos.x, y: startPos.y + Radius }
        // return combineParts([{ type: 'D', to: p1 }, { type }])
        return [pathL(p1), pathA(p2, 'A', '2'), pathL(endPos)]
      }
      // ArcBottomLeft 2/2 left to right
      case "D EC2 D": {
        const p1 = { x: startPos.x, y: endPos.y + Radius }
        const p2 = { x: startPos.x + Radius, y: endPos.y }
        return [pathL(p1), pathA(p2, 'C', '2'), pathL(endPos)]
      }
      // ArcTopLeft 1/2 right to left
      case "D EC3 D": {
        const p1 = { x: endPos.x + Radius, y: startPos.y }
        const p2 = { x: endPos.x, y: startPos.y - Radius }
        return [pathL(p1), pathA(p2, 'C', '3'), pathL(endPos)]
      }
      // ArcTopLeft 2/2 left to right
      case "D EA3 D": {
        const p1 = { x: startPos.x, y: endPos.y - Radius }
        const p2 = { x: startPos.x + Radius, y: endPos.y }
        return [pathL(p1), pathA(p2, 'A', '3'), pathL(endPos)]
      }
      // ArcBottomRight 1/2 right to left
      case "D EA1 D": {
        const p1 = { x: startPos.x, y: endPos.y + Radius }
        const p2 = { x: startPos.x - Radius, y: endPos.y }
        return [pathL(p1), pathA(p2, 'A', '1'), pathL(endPos)]
      }
      // ArcBottomRight 2/2 left to right
      case "D EC1 D": {
        const p1 = { x: endPos.x - Radius, y: startPos.y }
        const p2 = { x: endPos.x, y: startPos.y + Radius }
        return [pathL(p1), pathA(p2, 'C', '1'), pathL(endPos)]
      }
      // ArcTopRight 1/2 right to left
      case "D EC4 D": {
        const p1 = { x: startPos.x, y: endPos.y - Radius }
        const p2 = { x: startPos.x - Radius, y: endPos.y }
        return [pathL(p1), pathA(p2, 'C', '4'), pathL(endPos)]
      }
      // ArcTopRight 2/2 left to right
      case "D EA4 D": {
        const p1 = { x: endPos.x - Radius, y: startPos.y }
        const p2 = { x: endPos.x, y: startPos.y - Radius }
        return [pathL(p1), pathA(p2, 'A', '4'), pathL(endPos)]
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
        return [pathL(p1), pathA(p2, 'C', '4'), pathL(p3), pathA(p4, 'C', '3'), pathL(endPos)]
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
        return [pathL(p1), pathA(p2, 'A', '3'), pathL(p3), pathA(p4, 'A', '4'), pathL(endPos)]
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
        return [pathL(p1), pathA(p2, 'A', '1'), pathL(p3), pathA(p4, 'A', '2'), pathL(endPos)]
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
        return [pathL(p1), pathA(p2, 'C', '2'), pathL(p3), pathA(p4, 'C', '1'), pathL(endPos)]
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
        return [pathL(p1), pathA(p2, 'A', '2'), pathL(p3), pathA(p4, 'A', '3'), pathL(endPos)]
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
        return [pathL(p1), pathA(p2, 'C', '3'), pathL(p3), pathA(p4, 'C', '2'), pathL(endPos)]
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
        return [pathL(p1), pathA(p2, 'C', '1'), pathL(p3), pathA(p4, 'C', '4'), pathL(endPos)]
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
        return [pathL(p1), pathA(p2, 'A', '4'), pathL(p3), pathA(p4, 'A', '1'), pathL(endPos)]
      }
      // SCurveHorizontal 1/4 topleft to bottomright
      case "D EC2 D EA4 D": {
        const startEndLength = Math.abs(startPos.y - endPos.y) / 2 - Radius

        const p1 = { x: startPos.x, y: startPos.y - startEndLength }
        const p2 = { x: startPos.x + Radius, y: startPos.y - startEndLength - Radius }
        const p3 = { x: endPos.x - Radius, y: endPos.y + startEndLength + Radius }
        const p4 = { x: endPos.x, y: endPos.y + startEndLength }
        return [pathL(p1), pathA(p2, 'C', '2'), pathL(p3), pathA(p4, 'A', '4'), pathL(endPos)]
      }
      // SCurveHorizontal 2/4 bottomright to topleft
      case "D EC4 D EA2 D": {
        const startEndLength = Math.abs(startPos.y - endPos.y) / 2 - Radius

        const p1 = { x: startPos.x, y: startPos.y + startEndLength }
        const p2 = { x: startPos.x - Radius, y: startPos.y + startEndLength + Radius }
        const p3 = { x: endPos.x + Radius, y: endPos.y - startEndLength - Radius }
        const p4 = { x: endPos.x, y: endPos.y - startEndLength }
        return [pathL(p1), pathA(p2, 'C', '4'), pathL(p3), pathA(p4, 'A', '2'), pathL(endPos)]
      }
      // SCurveHorizontal 3/4 bottomleft to topright
      case "D EA3 D EC1 D": {
        const startEndLength = Math.abs(startPos.y - endPos.y) / 2 - Radius

        const p1 = { x: startPos.x, y: startPos.y + startEndLength }
        const p2 = { x: startPos.x + Radius, y: startPos.y + startEndLength + Radius }
        const p3 = { x: endPos.x - Radius, y: endPos.y - startEndLength - Radius }
        const p4 = { x: endPos.x, y: endPos.y - startEndLength }
        return [pathL(p1), pathA(p2, 'A', '3'), pathL(p3), pathA(p4, 'C', '1'), pathL(endPos)]
      }
      // SCurveHorizontal 4/4 topright to bottomleft
      // here
      case "D EA1 D EC3 D": {
        const startEndLength = Math.abs(startPos.y - endPos.y) / 2 - Radius

        const p1 = { x: startPos.x, y: startPos.y - startEndLength }
        const p2 = { x: startPos.x - Radius, y: startPos.y - startEndLength - Radius }
        const p3 = { x: endPos.x + Radius, y: endPos.y + startEndLength + Radius }
        const p4 = { x: endPos.x, y: endPos.y + startEndLength }
        return [pathL(p1), pathA(p2, 'A', '1'), pathL(p3), pathA(p4, 'C', '3'), pathL(endPos)]
      }
      // SCurveVertical 1/4 bottomright to topleft
      case "D EA2 D EC4 D": {
        const startEndLength = Math.abs(startPos.x - endPos.x) / 2 - Radius

        const p1 = { x: startPos.x - startEndLength, y: startPos.y }
        const p2 = { x: startPos.x - startEndLength - Radius, y: startPos.y + Radius }
        const p3 = { x: endPos.x + startEndLength + Radius, y: endPos.y - Radius }
        const p4 = { x: endPos.x + startEndLength, y: endPos.y }
        return [pathL(p1), pathA(p2, 'A', '2'), pathL(p3), pathA(p4, 'C', '4'), pathL(endPos)]
      }
      // SCurveVertical 2/4 topleft to bottomright
      case "D EA4 D EC2 D": {
        const startEndLength = Math.abs(startPos.x - endPos.x) / 2 - Radius

        const p1 = { x: startPos.x + startEndLength, y: startPos.y }
        const p2 = { x: startPos.x + startEndLength + Radius, y: startPos.y - Radius }
        const p3 = { x: endPos.x - startEndLength - Radius, y: endPos.y + Radius }
        const p4 = { x: endPos.x - startEndLength, y: endPos.y }
        return [pathL(p1), pathA(p2, 'A', '4'), pathL(p3), pathA(p4, 'C', '2'), pathL(endPos)]
      }
      // SCurveVertical 3/4 topright to bottomleft
      case "D EC3 D EA1 D": {
        const startEndLength = Math.abs(startPos.x - endPos.x) / 2 - Radius

        const p1 = { x: startPos.x - startEndLength, y: startPos.y }
        const p2 = { x: startPos.x - startEndLength - Radius, y: startPos.y - Radius }
        const p3 = { x: endPos.x + startEndLength + Radius, y: endPos.y + Radius }
        const p4 = { x: endPos.x + startEndLength, y: endPos.y }
        return [pathL(p1), pathA(p2, 'C', '3'), pathL(p3), pathA(p4, 'A', '1'), pathL(endPos)]
      }
      // SCurveVertical 4/4 bottomleft to topright
      case "D EC1 D EA3 D": {
        const startEndLength = Math.abs(startPos.x - endPos.x) / 2 - Radius

        const p1 = { x: startPos.x + startEndLength, y: startPos.y }
        const p2 = { x: startPos.x + startEndLength + Radius, y: startPos.y + Radius }
        const p3 = { x: endPos.x - startEndLength - Radius, y: endPos.y - Radius }
        const p4 = { x: endPos.x - startEndLength, y: endPos.y }
        return [pathL(p1), pathA(p2, 'C', '1'), pathL(p3), pathA(p4, 'A', '3'), pathL(endPos)]
      }

      default: {
        return [startCommand]
      }
    }
  })()

  return [startCommand, ...nextCommands].join(' ')
}

function pathL(to: Position) {
  return `L ${to.x} ${to.y}`
}

// https://developer.mozilla.org/ko/docs/Web/SVG/Tutorial/Paths#arcs
function pathA(to: Position, direction: CurveDirection, quardrant: Quadrant) {
  switch (direction) {
    case 'A':
      return `A ${Radius} ${Radius} 0 0 0 ${to.x} ${to.y}`
    case 'C':
      return `A ${Radius} ${Radius} 0 0 1 ${to.x} ${to.y}`
  }
}

function getBaseLength(length: number, quarterRoundLength: number, middleLength: number, deepDiff: number) {
  return (length - (2 * quarterRoundLength) - middleLength - deepDiff) / 2
}

export { usePath }