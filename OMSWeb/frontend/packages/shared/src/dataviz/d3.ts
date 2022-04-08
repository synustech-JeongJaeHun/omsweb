// @ts-nocheck
import * as d3 from 'd3'
import { getMaxString } from './base'

export const getArea = (xScale, yScale) => d3
  .area()
  .x(d => xScale(d[0]))
  .y0(d => yScale(d[1]))
  .y1(d => yScale(d[2]))

export const getLine = (xScale, yScale) => d3
  .line()
  .defined(d => !isNaN(d[1]))
  .x(d => xScale(d[0]))
  .y(d => yScale(d[1]))


export const getDomBox = (d3Dom) => d3Dom.node().getBoundingClientRect()


export const initSvg = ({ svg, container, width, height }) => {
  svg !== null && svg.remove()
  return container.append('svg').attr('width', width).attr('height', height)
}

export const getMargin = ([top, right, bottom, left]) => ({ top, right, bottom, left })

export const getMaxWidth = (context, arr) => {
  let width = null
  const maxStr = getMaxString(arr)
  const textG = context
    .append('g')
    .append('text')
    .text(maxStr)
  
  const info = textG.node().getBBox()
  width = info.width + 15
  textG.remove()

  return width
}