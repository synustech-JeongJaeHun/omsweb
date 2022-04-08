/* eslint-disable import/prefer-default-export */
// @ts-nocheck
import Color from 'color'
import * as R from 'ramda'

export const lighten = (hex: string, percent: number): string =>
  Color(hex).lighten(percent).hex()

export const lightenC = R.compose(R.curryN(2), R.flip)(lighten)

export const darken = (hex: string, percent: number): string =>
  Color(hex).darken(percent).hex()

export const darkenC = R.compose(R.curryN(2), R.flip)(darken)

export const genColor = (color, data) => {
  const { length } = data
  return data.map((item, i) => {
    const percent = 0.75 * (i / length)
    return darken(color, percent)
  })
}

export const getDirColor = (currDir, targetDir) => {
  if (currDir === 'both' || currDir === targetDir) {
    return 'red'
  }

  return 'steelblue'
}

export const hex2rgba = (hex, alpha = 1) => {
  const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};