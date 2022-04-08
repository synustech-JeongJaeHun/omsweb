// @ts-nocheck
import * as R from 'ramda'
import { isFullEmpty, isType } from './common'

const _ls = window.localStorage

export const ls = {
  set(key, value): void {
    if (!key || !value) {
      return
    }

    if (isType(value) === 'array' || isType(value) === 'object') {
      value = JSON.stringify(value)
    }
    _ls.setItem(key, value)
  },
  setObj(obj): void {
    const keys = R.keys(obj)
    keys.forEach((key) => {
      const value = obj[key]
      ls.set(key, value)
    })
  },
  get(key): any {
    let value = _ls.getItem(key)

    if (!value) {
      return
    }

    if (value[0] === '{' || value[0] === '[') {
      value = JSON.parse(value)
    }

    return value
  },
  getList(arr): any[] {
    return arr.map((key) => _ls.getItem(key))
  },
  getObj(arr): any {
    return arr.reduce((acc, key) => {
      acc[key] = _ls.getItem(key)
      return acc
    }, {})
  },
  remove(key): void {
    _ls.removeItem(key)
  },
  removeAll(): void {
    _ls.clear()
  },
}
