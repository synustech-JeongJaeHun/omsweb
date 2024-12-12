/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
import * as R from 'ramda'
import { color } from '@synusdev/styles'

const makeFlipCurry = R.compose(R.curryN(2), R.flip)
const sort = (arr) => arr.sort((a, b) => a - b)

// [red, yellow, green]
export const calcColor3 = (value, breakpoint = [30, 60]) => {
  breakpoint = sort(breakpoint)
  return R.cond([
    [R.allPass([R.lte(0), R.gt(breakpoint[0])]), R.always(color.healthLv5)],
    [
      R.allPass([R.lte(breakpoint[0]), R.gt(breakpoint[1])]),
      R.always(color.healthLv3),
    ],
    [R.allPass([R.lte(breakpoint[1]), R.gte(100)]), R.always(color.healthLv2)],
  ])(value)
}
export const calcColor3C = makeFlipCurry(calcColor3)
// [green, yellow, red]
export const calcColor3Reversed = (value, breakpoint = [30, 70]) => {
  breakpoint = sort(breakpoint)
  return R.cond([
    [R.allPass([R.lte(0), R.gt(breakpoint[0])]), R.always(color.healthLv2)],
    [
      R.allPass([R.lte(breakpoint[0]), R.gt(breakpoint[1])]),
      R.always(color.healthLv3),
    ],
    [R.allPass([R.lte(breakpoint[1]), R.gte(100)]), R.always(color.healthLv5)],
  ])(value)
}
export const calcColor3ReversedC = makeFlipCurry(calcColor3Reversed)

// [red, orange, yellow, green, blue] - prediction
export const calcColor5 = (value, breakpoint = [20, 40, 60, 80]) => {
  breakpoint = sort(breakpoint)
  return R.cond([
    [R.allPass([R.lte(0), R.gt(breakpoint[0])]), R.always(color.healthLv5)],
    [
      R.allPass([R.lte(breakpoint[0]), R.gt(breakpoint[1])]),
      R.always(color.healthLv4),
    ],
    [
      R.allPass([R.lte(breakpoint[1]), R.gt(breakpoint[2])]),
      R.always(color.healthLv3),
    ],
    [
      R.allPass([R.lte(breakpoint[2]), R.gt(breakpoint[3])]),
      R.always(color.healthLv2),
    ],
    [R.allPass([R.lte(breakpoint[3]), R.gte(100)]), R.always(color.healthLv1)],
  ])(value)
}

export const calcColor5C = makeFlipCurry(calcColor5)

// [blue, green, yellow, orange, red] - anomaly
export const calcColor5Reversed = (value, breakpoint = [20, 40, 60, 80]) => {
  breakpoint = sort(breakpoint)
  return R.cond([
    [R.allPass([R.lte(0), R.gt(breakpoint[0])]), R.always(color.healthLv1)],
    [
      R.allPass([R.lte(breakpoint[0]), R.gt(breakpoint[1])]),
      R.always(color.healthLv2),
    ],
    [
      R.allPass([R.lte(breakpoint[1]), R.gt(breakpoint[2])]),
      R.always(color.healthLv3),
    ],
    [
      R.allPass([R.lte(breakpoint[2]), R.gt(breakpoint[3])]),
      R.always(color.healthLv4),
    ],
    [R.allPass([R.lte(breakpoint[3]), R.gte(100)]), R.always(color.healthLv5)],
  ])(value)
}
export const calcColor5ReversedC = makeFlipCurry(calcColor5Reversed)

// [ 위험, 심각, 부족, 충분, 여유 ]
export const calcText = (value, breakpoint = [20, 40, 60, 80]) => {
  breakpoint = sort(breakpoint)
  return R.cond([
    [R.allPass([R.lte(0), R.gt(breakpoint[0])]), R.always('위험')],
    [R.allPass([R.lte(breakpoint[0]), R.gt(breakpoint[1])]), R.always('심각')],
    [R.allPass([R.lte(breakpoint[1]), R.gt(breakpoint[2])]), R.always('부족')],
    [R.allPass([R.lte(breakpoint[2]), R.gt(breakpoint[3])]), R.always('충분')],
    [R.allPass([R.lte(breakpoint[3]), R.gte(100)]), R.always('여유')],
  ])(value)
}
export const calcTextC = makeFlipCurry(calcText)

// [ 여유, 충분, 부족, 심각, 위험 ]
export const calcTextReversed = (value, breakpoint = [20, 40, 60, 80]) => {
  breakpoint = sort(breakpoint)
  return R.cond([
    [R.allPass([R.lte(0), R.gt(breakpoint[0])]), R.always('여유')],
    [R.allPass([R.lte(breakpoint[0]), R.gt(breakpoint[1])]), R.always('충분')],
    [R.allPass([R.lte(breakpoint[1]), R.gt(breakpoint[2])]), R.always('부족')],
    [R.allPass([R.lte(breakpoint[2]), R.gt(breakpoint[3])]), R.always('심각')],
    [R.allPass([R.lte(breakpoint[3]), R.gte(100)]), R.always('위험')],
  ])(value)
}
export const calcTextReversedC = makeFlipCurry(calcTextReversed)

// [ 나쁨, 보통, 양호 ]
export const calcTextTotalScore = (value, breakpoint = [80, 90]) => {
  breakpoint = sort(breakpoint)
  return R.cond([
    [R.allPass([R.lte(0), R.gt(breakpoint[0])]), R.always('나쁨')],
    [R.allPass([R.lte(breakpoint[0]), R.gt(breakpoint[1])]), R.always('보통')],
    [R.allPass([R.lte(breakpoint[1]), R.gte(100)]), R.always('양호')],
  ])(value)
}
export const calcTextTotalScoreC = makeFlipCurry(calcTextTotalScore)

export const getColorByNum = (num = 0) => {
  num = Number(num)

  const dic = [
    color.healthLv2,
    color.healthLv3,
    color.healthLv4,
    color.healthLv5,
  ]

  return dic[num]
}
