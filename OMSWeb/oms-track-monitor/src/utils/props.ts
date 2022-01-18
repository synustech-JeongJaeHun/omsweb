function parseNumberProp(defaultValue: number, n?: number | string) {
  const type = typeof n
  switch (type) {
    case "number":
      return n as number
    case "string":
      return parseInt(n as string)
    default:
      return defaultValue;
  }
}

export { parseNumberProp }