// @ts-nocheck
import * as R from 'ramda'
import { isFullEmpty, isType } from './common'

const ls = typeof window !== "undefined" ? window.localStorage : {}
export const getStorage = (stg = ls) => ({
  set(key, value): void {
    if (!key || !value) {
      return
    }

    if (isType(value) === 'array' || isType(value) === 'object') {
      value = JSON.stringify(value)
    }
    stg.setItem(key, value)
  },
  setObj(obj): void {
    const keys = R.keys(obj)
    keys.forEach((key) => {
      const value = obj[key]
      ls.set(key, value)
    })
  },
  get(key): any {
    let value = stg.getItem(key)

    if (!value) {
      return
    }

    if (value[0] === '{' || value[0] === '[') {
      value = JSON.parse(value)
    }

    return value
  },
  getList(arr): any[] {
    return arr.map((key) => stg.getItem(key))
  },
  getObj(arr): any {
    return arr.reduce((acc, key) => {
      acc[key] = stg.getItem(key)
      return acc
    }, {})
  },
  remove(key): void {
    stg.removeItem(key)
  },
  removeAll(): void {
    stg.clear()
  },
})
