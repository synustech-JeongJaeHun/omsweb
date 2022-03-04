// before edit this file, check this mdn article
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
type TransformFunction =
  | { name: "translate", x: number, y?: number }
  | { name: "scale", x: number, y?: number }
  | { name: "rotate", a: number, x: undefined, y: undefined }
  | { name: "rotate", a: number, x: number, y: number }

function getSvgTranformInString(func: TransformFunction): string {
  switch (func.name) {
    case "scale":
      return func.y === undefined
        ? `scale(${func.x})`
        : `scale(${func.x} ${func.y})`

    case "translate":
      return func.y === undefined
        ? `translate(${func.x})`
        : `translate(${func.x} ${func.y})`

    case "rotate":
      return func.x === undefined
        ? `rotate(${func.a})`
        : `rotate(${func.a},${func.x},${func.y})`
  }
}

/**
 * Svg Transform differs from CSS Transform 
 */
function getSvgTranformsInString(funcs: TransformFunction[]): string {
  return funcs.map(getSvgTranformInString).join(' ')
}

export { getSvgTranformsInString }