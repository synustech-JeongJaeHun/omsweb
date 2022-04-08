import * as R from 'ramda'
import { isFullEmpty } from './common'

export const getSafeData = (emptyData = {}, data = {}) => (key) => {
  const currentData = data[key]
  const currentEmptyData = emptyData[key]
  const value = isFullEmpty(currentData) ? null : currentData
  return R.defaultTo(currentEmptyData)(value)
}