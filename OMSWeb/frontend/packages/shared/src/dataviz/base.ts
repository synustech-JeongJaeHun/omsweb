// @ts-nocheck
import * as R from 'ramda'

export const set = method => (context, obj) => {
  R.keys(obj).forEach(key => {
    context[method](key, obj[key])
  })
  return context
}

export const safePx = (val : number | string) : string => {
  return typeof val === 'number' ? `${val}px` : val
}

export const getDimensions = ({ margin, width, height }) => {

  const chartWidth = width - (margin.left + margin.right)
  const chartHeight = height - (margin.top + margin.bottom)

  return {
    scale: {
      xStart: margin.left,
      xEnd: width - margin.right,
      yStart: height - margin.bottom,
      yEnd: margin.top,
    },
    chart: {
      x: margin.left,
      y: margin.top,
      width: chartWidth,
      height: chartHeight,
      xCenter: margin.left + (chartWidth / 2),
      yCenter: margin.top + (chartHeight / 2),
    }
  }
}

export const filterDuration = ({ func, start, end }) => data => {
  const getComparator = (pos) => {
    const comparator = item => pos === 'start' ? func(item) >= start: func(item) <= end
    return item => comparator(item)
  }
  return R.compose(
    R.filter(getComparator('end')),
    R.filter(getComparator('start'))
  )(data)
}

export const getAreaClipData = ({data, margin, inverter, height}) => {
  return data.reduce((acc, item) => {
    const [ts, top, bottom] = item
    acc.top.push([ts, inverter(margin.top), bottom])
    acc.bottom.push([ts, top, inverter(height - margin.bottom)])

    return acc
  }, {top: [], bottom: []})
}

export const getMinMax = R.reduce(([min, max], item) => {
  return [R.min(item, min), R.max(item, max)]
}, [undefined, undefined])

export const getExtent = (data, extra = []) => {
  const arr = R.values(data)
  const temp= arr.filter(item => item.length > 0)

  const extent = (isX) => {
    const func = isX ? R.slice(0, 1) : R.tail

    return R.compose(
      getMinMax,
      R.reduce(R.concat, []),
      R.reduce(R.concat, []),
      R.map(R.map(func))
    )(temp)
  }

  const getYExtent = ([min, max], hasPadding = '') => {
    const has = (str) => hasPadding.indexOf(str) >= 0
    const height = Math.abs(max - min)
    const delta = height / 15
    const _min = has('b') ? min - delta : min
    const _max = has('t') ? max + delta : max
    return [_min, _max]
  }

  const yExtent = getMinMax([...extent(false), ...extra]) 

  return {
    xExtent: extent(true),
    yExtent,
    yExtentP: getYExtent(yExtent, 'bt'),
    yExtentO: {
      b: getYExtent(yExtent, 'b'), 
      t: getYExtent(yExtent, 't'), 
      bt: getYExtent(yExtent, 'bt')
    },
  }
}

export const getMaxString = (arr) => {
  const { str } = arr.reduce((acc, item) => {
    const { length } = String(item)
    if (acc.length <= length ) {
      acc.length = length 
      acc.str = String(item)
    }
    return acc
  }, {
    length: 0,
    str: ''
  })

  return str
}

/*
const exData = [
  ['stage-1', 888, 888],
  ['dev-1', 154, 171],
]
*/
export const makeDiffData = (data) => {
  const obj = {
    left: {
      values: [],
      texts: []
    },
    right: {
      values: [],
      texts: []
    },
    extent: [],
    diffs: []
  }

  const diffList = data.map(([name, before, after]) => after - before)
  const temp = diffList.reduce((acc, item) => {
    if (item > 0) {
      acc.right.values.push(item)
      acc.left.values.push(0)
    } else {
      acc.right.values.push(0)
      acc.left.values.push(Math.abs(item))
    }
    return acc
  }, obj)

  const { left, right } = temp
  const extent = R.compose(getMinMax, R.map(Math.abs), R.concat(left.values))(right.values)
  temp.extent = extent
  temp.diffs = temp.right.values.map((item, i) => item - temp.left.values[i])
  temp.right.texts = temp.diffs.map(item => item > 0 ? `+${item}` : item === 0 ? 0 : '')
  temp.left.texts = temp.diffs.map(item => item < 0 ? item : '')

  return temp
}