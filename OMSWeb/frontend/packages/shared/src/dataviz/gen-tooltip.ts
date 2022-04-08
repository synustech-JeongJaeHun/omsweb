// @ts-nocheck
import moment from 'moment'
import * as R from 'ramda'
import { set } from './base'
import * as d3 from 'd3'

const getBgUrl = ({ width, height, strokeColor }) => (lineType = 'default', opt = {}) => {
  const defaultValue = lineType === 'default' ? { x1: 0, y1: 0, x2: width, y2: height } : { x1: 0, y1: height, x2: width, y2: 0 }
  const { x1, x2, y1, y2 } = { ...defaultValue, ...opt }
  return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='${strokeColor}' stroke-width='1' /></svg>")`
}

const getTTStyles = ({ width, height, bgColor }) => ({
  isLessThanHalfX,
  isLessThanHalfY,
  tooltipBox,
  xCoord,
  yCoord
}) => {

  const _width = `${width}px` || '20px'
  const _height = `${height}px` || '20px'

  let ttStyle = {}
  let ttcStyle = {}
  const isPos = () => {
    if (isLessThanHalfX && isLessThanHalfY) {
      return 'tr'
    } else if (isLessThanHalfX && !isLessThanHalfY) {
      return 'br'
    } else if (!isLessThanHalfX && isLessThanHalfY) {
      return 'tl'
    } else if (!isLessThanHalfX && !isLessThanHalfY) {
      return 'bl'
    }
  }

  const _getBgUrl = getBgUrl({ width, height, strokeColor: bgColor })

  const ttcStyleDefault = {
    top: 'auto',
    bottom: 'auto',
    left: 'auto',
    right: 'auto',
  }

  switch (isPos()) {
    case 'tr':
      ttStyle = {
          'background-image': _getBgUrl('cross'),
          'background-position': 'top right',
      }
      ttcStyle = {
        ...ttcStyleDefault,
        top: _height,
        right: _width,
      }
      break
    case 'br':
      ttStyle = {
        'background-image': _getBgUrl(),
        'background-position': 'bottom right',
      }
      ttcStyle = {
        ...ttcStyleDefault,
        bottom: _height,
        right: _width,
      }
      break
    case 'tl':
      ttStyle = {
        'background-image': _getBgUrl(),
        'background-position': 'top left',
        top: `${yCoord + (tooltipBox.height - height + 15)}px`,
        left: `${xCoord - width + 8}px`,
      }
      ttcStyle = {
        ...ttcStyleDefault,
        top: _height,
        left: _width,
      }
      break
    case 'bl':
      ttStyle = {
        'background-image': _getBgUrl('cross'),
        'background-position': 'bottom left',
      }
      ttcStyle = {
        ...ttcStyleDefault,
        bottom: _height,
        left: _width,
      }
      break
    default:
      ttStyle = {
        'background-image': _getBgUrl('cross'),
        'background-position': 'bottom left',
      }
      break
  }

  return { ttStyle, ttcStyle }
}

function genTooltip(context, opt) {
  const defaultOps = {
    width: 15,
    height: 15,
    bgColor: 'steelblue'
  }

  const { width, height, bgColor } = { ...defaultOps, ...opt}

  const tooltipStyle = {
    position: 'absolute',
    'z-index': 10,
    'background-image': getBgUrl({ width, height, bgColor })('cross'),
    'background-repeat': 'no-repeat',
    'background-position': 'bottom left',
    'background-size': `${width}px ${height}px`,
    'transform': `translate(${width}px, calc(-100% + ${height}px))`,
    color: 'white',
    font: '12px sans-serif',
  }

  const tooltipContentStyle = {
    position: 'relative',
    bottom: 0,
    left: 0,
    padding: '8px',
    'background-color': bgColor,
  }

  const tooltip = context.append("div")
    .attr('class', 'tooltip')
    .call(set('style'), tooltipStyle)

  const tooltipContent = tooltip.append('div')
    .attr('class', 'tooltip-content')
    .call(set('style'), tooltipContentStyle)

  const getTooltipStyle = ({
    isLessThanHalfX, isLessThanHalfY, xCoord, yCoord, extraBgColor
  }) => {
    const tooltipBox = tooltipContent.node().getBoundingClientRect()

    const tooltipCoord = {
      top: isLessThanHalfY ? `${yCoord + (tooltipBox.height - height)}px` : `${yCoord - height}px`,
      left: isLessThanHalfX ? `${xCoord - (tooltipBox.width + width)}px` : `${xCoord - width}px`,
    }

    const { ttStyle, ttcStyle } = getTTStyles({
      width,
      height,
      bgColor: extraBgColor || bgColor
    })({
      isLessThanHalfX, isLessThanHalfY,
      tooltipBox, xCoord, yCoord
    })

    return {
      tooltipStyle: { ...tooltipCoord, ...ttStyle },
      tooltipContentStyle: {...ttcStyle, 'background-color': extraBgColor || bgColor }
    }
  }

  return {
    tooltip,
    tooltipContent,
    getTooltipStyle,
  }
}


export default genTooltip
