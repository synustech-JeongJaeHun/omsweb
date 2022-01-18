
type Position = { x: number, y: number }
type Path = string
function useAnimatePath(startPos: Position, endPos: Position, path: Path) {
  const pathElement = new SVGPathElement()
  pathElement.setAttribute('d', path)

  // const totalLength = 
  // pathElement.getPointAtLength()
  // pathElement.

  // return {}
}

export { useAnimatePath }