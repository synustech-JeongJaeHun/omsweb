// @ts-nocheck
import * as R from 'ramda'

export function convertObjToQueryStr(obj, pick = []) {
  
  const pickedObj = pick.length === 0 ? obj: R.pick(pick, obj)
  const keys = R.keys(pickedObj)
  const length = keys.length
  return keys.reduce((acc, key, i) => {
    const value = pickedObj[key]
    const needMore = length > i + 1 ? '&' : ''
    acc += `${key}=${value}${needMore}`
    return acc
  }, '')
}

const log = (ret) => {
  console.log('ret', ret)
  return ret
}

export const convertQsToObj = R.compose(
  R.fromPairs,
  R.map(R.split('=')),
  R.split('&'),
  R.replace(/\?/ig, '')
)

export const modifyQs = (qs, obj) => {
  const temp = convertQsToObj(qs)

  const _obj = R.keys(obj).reduce((acc, key) => {
    if (acc[key]) {
      acc[key] = obj[key]
    }

    return acc
  }, temp)

  return convertObjToQueryStr(_obj)
}