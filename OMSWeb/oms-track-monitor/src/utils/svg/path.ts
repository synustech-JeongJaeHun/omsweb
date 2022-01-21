import { D } from "../../types/D"
import { Position } from "../../types/Position"

function createSvgElement(name: keyof SVGElementTagNameMap) {
  return document.createElementNS('http://www.w3.org/2000/svg', name)
}

function createPathElement(d: D): SVGPathElement {
  const pathElement = createSvgElement('path') as SVGPathElement
  pathElement.setAttribute('d', d)
  return pathElement
}

function getPositionFromD(d: D, distance: number) {
  const pathElement = createPathElement(d)
  return pathElement.getPointAtLength(distance)
}

const SvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
function createPoint(position: Position) {
  const point = SvgElement.createSVGPoint()
  point.x = position.x
  point.y = position.y
  return point
}

function isPointInPathD(d: D, position: Position) {
  const
    path = createPathElement(d),
    point = createPoint(position)
  return path.isPointInStroke(point)
}



export { getPositionFromD, isPointInPathD }