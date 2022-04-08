// @ts-nocheck
import * as R from 'ramda'


const _numRound = (digit, isOff, num) => {
  const temp = Math.pow(10, digit)
  const func = isOff ? Math.floor: Math.round
  return func(num * temp) / temp
}

export const numRound = R.curryN(3, _numRound)

