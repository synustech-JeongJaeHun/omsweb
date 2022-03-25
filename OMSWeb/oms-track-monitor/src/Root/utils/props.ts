import { Boolish, Numberlish, Stringlish } from '../types/Prop'

function parseNumberProp(defaultValue: number, n: Numberlish) {
  if (typeof n === 'number') {
    if (Number.isNaN(n)) return defaultValue
    else return n
  } else if (typeof n === 'string') {
    const parsed = parseInt(n)
    if (Number.isInteger(parsed)) return parsed
    else return defaultValue
  } else return defaultValue
}

function parseBooleanProp(defaultValue: boolean, b: Boolish) {
  if (typeof b === 'boolean') return b
  else if (typeof b === 'string') {
    const refined = b.toLowerCase().trim()
    if (refined === 'true') return true
    else if (refined === 'false') return false
    else return defaultValue
  } else return false
}

function parseStringProp(defaultValue: string, s: Stringlish) {
  if (typeof s === 'string') {
    if (s === '') return defaultValue
    else return s
  } else return defaultValue
}

export { parseNumberProp, parseBooleanProp, parseStringProp }
