/* eslint-disable import/prefer-default-export */
import * as R from 'ramda'
import { paneBodyBreakpoint } from '@daimre/styles'

const _breakpoints = R.reduce(
  (acc, item) => acc.concat(item[1]),
  [],
  R.values(paneBodyBreakpoint),
)

export const calcBreakpoint = (value, breakpoints = _breakpoints) =>
  R.cond([
    [R.equals(0), R.always('sm')],
    [R.allPass([R.lte(0), R.gt(breakpoints[0])]), R.always('sm')],
    [R.allPass([R.lte(breakpoints[0]), R.gt(breakpoints[1])]), R.always('md')],
    [R.allPass([R.lte(breakpoints[1]), R.gte(breakpoints[2])]), R.always('lg')],
  ])(value)
