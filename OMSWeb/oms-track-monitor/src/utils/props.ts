function parseNumberProp(defaultValue: number, n: number | string | undefined | null) {
  if (typeof n === 'number') {
    if (Number.isNaN(n)) return defaultValue
    else return n
  }
  else if (typeof n === 'string') {
    const parsed = parseInt(n)
    if (Number.isInteger(parsed)) return parsed
    else return defaultValue
  }
  else return defaultValue
}

function parseBooleanProp(defaultValue: boolean, b: boolean | string | undefined | null) {
  if (typeof b === 'boolean') return b
  else if (typeof b === 'string') {
    const refined = b.toLowerCase().trim()
    if (refined === 'true') return true
    else if (refined === 'false') return false
    else return defaultValue
  }
  else return false
}

export { parseNumberProp, parseBooleanProp }