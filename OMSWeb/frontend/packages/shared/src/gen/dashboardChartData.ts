import { color } from '@synusdev/styles'
import { genBaseline } from '../dataviz'
import genMultipleRect from './multipleRect'
import genStackedArea from './stackedArea'

// multipleLine
const multipleLineData = () => {
  const params = {
    totalLength: 200, 
    ranges: 200, 
    unit: 'seconds',  
    forecast: 0, 
    randNum: 200, 
    uunit: 20,
  }
  
  return [
    {
      id: 'instance-a',
      color: color.extraLv1,
      data: genBaseline(params),
    },
    {
      id: 'instance-b',
      color: color.extraLv2,
      data: genBaseline(params),
    },
    {
      id: 'instance-c',
      color: color.extraLv3,
      data: genBaseline(params),
    },
    {
      id: 'instance-d',
      color: color.extraLv4,
      data: genBaseline(params),
    },
  ]
}
// horizontalBar
const horizontalBarData = () => {
  const exData = [
    ['node-1', 0.80],
    ['node-2', 0.50],
    ['demo-1', 0.40],
    ['stage-1', 0.30],
    ['qa-1', 0.20],
    ['opsmgt-1', 0.19],
    ['skunkworks', 0.15],
    ['admin', 0.08],
  ]

  return exData
}

// multipleRect - genMultipleRect

// stackedArea - genStackedArea
const stackedAreaData = genStackedArea

// horizontalDiffBar
const horizontalDiffBarData = () => {
  const exData = [
    ['stage-1', 888, 888],
    ['dev-1', 154, 171],
    ['demo-1', 113, 113],
    ['prod-1', 93, 93],
    ['qa-1', 64, 57],
    ['opsmgt-1', 55, 80],
    ['skunkworks', 155, 50],
    ['admin', 20, 5],
  ]
  return exData
}


// stackedHorizontalBar
const stackedHorizontalBarData = () => {
  const exData = [
    ['Project A', 291, 327],
    ['Project B', 155, 239],
    ['demo-1', 432, 515],
    ['stage-1', 103, 251],
    ['qa-1', 87, 277],
    ['opsmgt-1', 119, 301],
    ['skunkworks', 139, 359],
    ['admin', 59, 291],
  ]

  return exData
}

const genDashboardChart = (variant) => {
  switch (variant) {
    case 'ml':
      return multipleLineData
    case 'hb':
      return horizontalBarData
    case 'mr':
      return genMultipleRect
    case 'sa':
      return genStackedArea
    case 'hdb': 
      return horizontalDiffBarData
    case 'shb':
      return stackedHorizontalBarData
    default:
      return () => {}
  }
}

export default genDashboardChart
