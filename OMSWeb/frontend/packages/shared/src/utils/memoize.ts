import * as R from 'ramda'
import { isFullEmpty, serial } from './common' 

export const memoizeAsync = (fn) => {
  const cache = new Map()
  return async (...args) => {
    const n = args[0]
    if (cache.has(n)) {
      return R.clone(cache.get(n))
    }
    const result = await fn(n)
    cache.set(n, R.clone(result))
    return result
  }
}

export const memoizeAsyncApiNoCache = (cache) => (fn) => async (params, ...args) => {
  const paramsString = serial.encode(params)
  const key = [paramsString, ...args].join('|')
  if (cache.has(key)) {
    return R.clone(cache.get(key))
  }
  const allParams = [params, ...args]
  const result = await fn(...allParams)
  cache.set(key, R.clone(result))
  return result
}

export const memoizeAsyncApi = memoizeAsyncApiNoCache(new Map())