// @ts-nocheck
import * as R from 'ramda'
import { numRound } from './number'

const aggregator = {
  avg: (arr) => {
    const length = arr.length
    return numRound(1, false, R.sum(arr) / length)
  },
  sum: R.sum,
  min: R.reduce(R.min, Infinity),
  max: (arr) => {
    return arr.reduce((acc, item) => {
      acc = R.max(item, acc)
      return acc
    }, undefined)
  }, 
}


export default aggregator