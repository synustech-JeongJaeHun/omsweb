function parseNumberProp(defaultValue: number, n: number | string | undefined) {
  switch (typeof n) {
    case "number":
      return n
    case "string":
      return parseInt(n as string)
    default:
      return defaultValue;
  }
}

function parseBooleanProp(defaultValue: boolean, n: boolean | string | undefined) {
  switch (typeof n) {
    case "boolean":
      return n
    case "string":
      return n.toLowerCase().trim() === "true"
    default:
      return defaultValue;
  }
}

export { parseNumberProp, parseBooleanProp }