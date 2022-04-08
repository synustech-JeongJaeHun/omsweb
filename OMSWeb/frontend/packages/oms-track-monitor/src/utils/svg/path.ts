import { D } from "../../types/D"

function createPathElement(d: D): SVGPathElement {
  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  pathElement.setAttribute('d', d)
  return pathElement
}

function getPositionFromD(d: D, distance: number) {
  const pathElement = createPathElement(d)
  return pathElement.getPointAtLength(distance)
}

export { createPathElement, getPositionFromD }