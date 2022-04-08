// @ts-nocheck
import * as d3 from 'd3'
import * as R from 'ramda'
import { set, safePx, getDimensions, getAreaClipData, getExtent } from './base'
import { getDirColor } from '../utils/color'
import { getArea, getLine, getDomBox, initSvg, getMargin } from './d3'
import { axisStyle, axisLabelStyle } from './d3-styles'
import { hex2rgba } from '../utils/color'
import { isFullEmpty, isNotFullEmpty } from '../utils/common'

export const genAxis = ({
  data, margin, width, height, svg, opt = {}
}) => {
  const defaultOpt = {
    isShowGridY: false,
    extraY: [],
    hasPadding: 'bt', // 'b', 't', 'bt'
  }

  const {
    isShowGridY,
    extraY,
    hasPadding
  } = { ...defaultOpt, ...opt }

  const { xExtent, yExtentO } = getExtent(data, extraY)
  const yExtent = yExtentO[hasPadding]
  const dim = getDimensions({ margin, width, height })

  const xScale = d3.scaleTime()
    .domain(xExtent)
    .range([dim.scale.xStart, dim.scale.xEnd])

  const yScale = d3.scaleLinear()
    .domain(yExtent).nice()
    .range([dim.scale.yStart, dim.scale.yEnd])

  const xAxis = label => g => g
    .attr('class', 'axis xAxis')
    .attr('transform', `translate(0, ${dim.scale.yStart})`)
    .call(d3.axisBottom(xScale))
    .append('text')
    .text(label)
    .call(set('style'), axisLabelStyle)
    .call(set('attr'), {
      x: dim.chart.xCenter,
      y: 50,
    })

  const yAxis = label => g => g
    .attr('class', 'axis yAxis')
    .attr('transform', `translate(${dim.scale.xStart}, 0)`)
    .call(d3.axisLeft(yScale))
    .append('text')
    .text(label)
    .call(set('style'), axisLabelStyle)
    .call(set('attr'), {
      transform: 'rotate(-90)',
      x: -dim.chart.yCenter,
      y: -50
    })

  if(isShowGridY) {
    const gridlinesY = () => d3.axisLeft().scale(yScale)
    svg.append('g')
      .attr('class', 'grid')
      .call(
        gridlinesY()
          .tickSize(
            -1 * dim.chart.width
          )
          .tickFormat('')
      )
      .attr('transform', `translate(${dim.chart.x}, 0)`)
  }


  svg.append('g')
    .call(set('style'), axisStyle)
    .call(xAxis(''))
  svg.append('g')
    .call(set('style'), axisStyle)
    .call(yAxis(''))


  return {
    xScale, yScale, xExtent, yExtent
  }
}

export const genAnomalyChart = ({
  areaData,
  lineData,
  margin,
  height,
  direction,
  svg,
  xScale,
  yScale,
}) => {
  if (isFullEmpty(areaData)) { 
    return false
  }

  const { top: topAnomaly, bottom: bottomAnomaly, } = getAreaClipData({
    data: areaData,
    margin,
    height,
    inverter: yScale.invert
  })

  const lineAreaInfo = {
    top: {
      data: topAnomaly,
      fill: '#0cc6ea59',
      stroke: getDirColor(direction, 'above'),
    },
    bottom: {
      data: bottomAnomaly,
      fill: '#0cc6ea59',
      stroke: getDirColor(direction, 'below'),
    },
    body: {
      data: areaData,
      fill: '#0cc6ea59',
      stroke: 'steelblue'
    }
  }

  const area = getArea(xScale, yScale)
  const line = getLine(xScale, yScale)

  R.keys(lineAreaInfo).forEach((key) => {
    const item = lineAreaInfo[key]

    svg.append('clipPath')
      .attr('id', `${key}-anomaly-mask`)
      .append('path')
      .datum(item.data)
      .attr('fill', item.fill)
      .attr('d', area)
  })

  svg
    .append('path')
    .datum(areaData)
    .attr('fill', hex2rgba('#ffffff', 0.1))
    .attr('d', area)

  R.keys(lineAreaInfo).forEach((key) => {
    const item = lineAreaInfo[key]

    svg.append('path')
      .datum(lineData)
      .call(set('attr'), {
        'clip-path': `url(#${key}-anomaly-mask)`,
        fill: 'none',
        stroke: item.stroke,
        'stroke-width': 2,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
        d: line
      })
  })
}


export const genThresholderChart = ({
  data,
  svg,
  width,
  height,
  margin,
  xScale,
  yScale,
  thresholderValue,
  direction,
  hideThresholder = false,
  attr = {}
}) => {
  if (isFullEmpty(data)) { 
    return false
  }

  const line = getLine(xScale, yScale)
  const dim = getDimensions({ margin, width, height })
  const isDirection = (dir) =>  {
    if (hideThresholder) {
      return 'steelblue'
    }

    return direction === dir ? 'red' : 'steelblue'
  }

  const forecastStart = R.head(data)
  const forecastStartTimestamp = R.head(forecastStart)

  const basePathAttr = {
    fill: 'none',
    stroke: 'steelblue',
    'stroke-width': 1,
    'stroke-linejoin': 'round',
    'stroke-linecap': 'round',
    d: line,
    ...attr
  }

  const baseAttr = {
    x: xScale(forecastStartTimestamp),
    width: dim.chart.width - (xScale(forecastStartTimestamp) - margin.left),
  }

  const lineInfo = {
    top: {
      attr: {
        ...baseAttr,
        y: margin.top,
        height: yScale(thresholderValue) - margin.top,
      },
      stroke: isDirection('above'),
    },
    bottom: {
      attr: {
        ...baseAttr,
        y: yScale(thresholderValue),
        height: dim.chart.height - yScale(thresholderValue),
      },
      stroke: isDirection('below'),
    }
  }

  R.keys(lineInfo).forEach((key) => {
    const item = lineInfo[key]

    svg.append('clipPath')
      .attr('id', `${key}-thresholder-mask`)
      .append('rect')
      .call(set('attr'), item.attr)
  })

  if (hideThresholder === false) {
    const thresholderG = svg.append('g').attr('class', 'thresholder-group')
    thresholderG
      .append('line')
      .attr('x1', xScale(forecastStartTimestamp))
      .attr('y1', yScale(thresholderValue) )
      .attr('x2', width - margin.right)
      .attr('y2', yScale(thresholderValue))
      .attr('stroke', 'red')
      .attr("stroke-width", 2)
  
    thresholderG
      .append('text')
      .call(set('attr'), {
        x: width - margin.right,
        y: yScale(thresholderValue) - 6,
        'text-anchor': 'end'
      })
      .call(set('style'), {
        fill: 'white',
        'font-size': 12
      })
      .text(`예측 임계값: ${thresholderValue}`)
  }


  R.keys(lineInfo).forEach(key => {
    const item = lineInfo[key]

    svg.append('path')
      .datum(data)
      .call(set('attr'), {
        ...basePathAttr,
        'clip-path':  `url(#${key}-thresholder-mask)`,
        stroke: item.stroke
      })
  })
}

export const genForecastChart = ({
  forecastData,
  workloadData,
  svg,
  width,
  height,
  margin,
  xScale,
  yScale,
  thresholderValue,
  hideThresholder = false,
  direction
}) => {
  if (isFullEmpty(forecastData)) { 
    return false
  }

  const line = getLine(xScale, yScale)

  const forecastStart = R.head(forecastData)
  svg.append('path')
    .datum([...workloadData, forecastStart])
    .call(set('attr'), {
      fill: 'none',
      stroke: 'steelblue',
      'stroke-width': 1,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      d: line
    })


  const forecastStartTimestamp = R.head(forecastStart)

  const currentLineG = svg.append('g').attr('class', 'current-line')
  currentLineG
    .append('line')
    .call(set('attr'), {
      x1: xScale(forecastStartTimestamp),
      y1: height - margin.bottom,
      x2: xScale(forecastStartTimestamp),
      y2: margin.top,
      stroke: 'white',
      'stroke-width': 1,
    })

  currentLineG
    .append('text')
    .call(set('attr'), {
      x: xScale(forecastStartTimestamp) + 5,
      y: margin.top + 6 + 5,
      'text-anchor': 'start'
    })
    .call(set('style'), {
      fill: 'white',
      'font-size': 12
    })
    .text(`예측 1주`)


  genThresholderChart({
    data: forecastData,
    svg,
    width,
    height,
    margin,
    xScale,
    yScale,
    thresholderValue,
    hideThresholder,
    direction,
    attr: {
      'stroke-dasharray': '4, 4',
    }
  })
}
