import { Position } from "../types/Position"

function createSvgElement(name: string) {
  return document.createElementNS('http://www.w3.org/2000/svg', name)
}

function createPathElement(d: string): SVGPathElement {
  const pathElement = createSvgElement('path') as SVGPathElement
  pathElement.setAttribute('d', d)
  return pathElement
}

function getPositionFromD(d: string, distance: number) {
  const pathElement = createPathElement(d)
  return pathElement.getPointAtLength(distance)
}

function isPointInPathD(d: string, position: Position) {
  const path = createPathElement(d)
  return path.isPointInStroke(position)
}

export { getPositionFromD, isPointInPathD }