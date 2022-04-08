// @ts-nocheck
import { color } from '@daimre/styles'
import { genBaseline } from '../dataviz'
import { hex2rgba } from '../utils'

const genStackedArea = () => {
  const params = {
    num: 200, 
    ranges: 200, 
    unit: 'seconds',  
    forecast: 0,
    duration: 0, 
    randNum: 200, 
    uunit: 20,
  }
  
  let a = genBaseline(params)
  let b = genBaseline(params)
  b = b.map(d => d[1])
  let c = genBaseline(params)
  c = c.map(d => d[1])
  
  const mergedList = a.map((item, i) => {
    return {
      x: item[0],
      y: [0, Math.abs(item[1]), Math.abs(b[i]), Math.abs(c[i])]
    }
  }).reduce((acc, { x, y}) => {
    const y2 = y[1] + y[2]
    const y3 = y2 + y[3]
    acc.a.push([x, y[0], y[1]])
    acc.b.push([x, y[1], y2])
    acc.c.push([x, y2, y3])
  
    return acc
  }, {a: [], b: [], c: []})
  
  const exData = [
    {
      id: 'property-a',
      strokeColor: color.extraLv3,
      color: hex2rgba(color.extraLv3, 0.75),
      data: mergedList['a']
    },
    {
      id: 'property-b',
      strokeColor: color.extraLv2,
      color: hex2rgba(color.extraLv2, 0.75),
      data: mergedList['b'],
    },
    {
      id: 'property-c',
      strokeColor: color.extraLv1,
      color: hex2rgba(color.extraLv1, 0.75),
      data: mergedList['c'],
    }
  ]

  return exData
}


export default genStackedArea