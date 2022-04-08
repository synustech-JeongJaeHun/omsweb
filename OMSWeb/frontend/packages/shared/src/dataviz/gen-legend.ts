// @ts-nocheck
import * as R from 'ramda'
import * as d3 from 'd3'
import { set, getDimensions } from './base'


function getBaseCoord(
  context, {
  pos, width, height,
  dim, margin, direction, circleR,
  widthBoxSizing
}) {
  const boxSize = context.node().getBBox()
  const halfChartWidth = dim.chart.width / 2
  const isMarginBox = widthBoxSizing === 'margin'
  const x = {
    center: circleR + margin.left + halfChartWidth - boxSize.width / 2,
    left: isMarginBox ? circleR + margin.left : circleR,
    right: isMarginBox ? width - (boxSize.width + margin.right - circleR) : width - (boxSize.width - circleR),
  }
  const y = {
    top: circleR * 2,
    vTop: circleR * 2 + (boxSize.y * 0.158),
    bottom: height - circleR,
    vBottom: height - (boxSize.height + boxSize.y)
  }

  const defaultPos = {
    tr: { x: x.right, y: y.top},
    tl: { x: x.left, y: y.top},
    tc: { x: x.center, y: y.top},
    br: { x: x.right, y: y.bottom},
    bl: { x: x.left, y: y.bottom},
    bc: { x: x.center, y: y.bottom}
  }
  let finalPos = {...defaultPos}

  if (direction === 'vertical') {
    finalPos = {
      tr: { x: x.right, y: y.vTop},
      tl: { x: x.left, y: y.vTop},
      tc: { x: x.center, y: y.vTop},
      br: { x: x.right, y: y.vBottom},
      bl: { x: x.left, y: y.vBottom},
      bc: { x: x.center, y: y.vBottom}
    }
  }

  return {...finalPos[pos], boxSize }
}

function genLegend(context, { svg, data, width, height, margin, opt, callback }) {
  const dim = getDimensions({ margin, width, height })
  const widths = []
  const defaultOpt = {
    direction: 'horizon',  // horizon, vertical
    pos: 'bc',
    hItemSpace: 14,
    vItemSpace: 5,
    events: {
      mouseover: () => {},
      mouseout: () => {}
    },
    dx: 0,
    dy: 0,
    fontSize: 10,
    widthBoxSizing: 'margin', // margin, none
  }
  opt = opt || {}

  const {
    direction,
    pos, events,
    hItemSpace,
    vItemSpace,
    dx, dy,
    fontSize,
    widthBoxSizing,
  } = { ...defaultOpt, ...opt }
  const circleR = fontSize / 2

  const legendNode = context.append('g').attr('class', 'legend')
  const overlay = legendNode.append('rect')
    .call(set('attr'), {
      class: 'legend-overlay',
      x: -circleR, y: -(fontSize * 0.85),
      fill: 'transparent'
    })

  data.forEach((d, i) => {
    const item = legendNode
      .append('g')
      .attr('class', 'legend-item')
      .style('cursor','pointer')

    // direction (horizon or vertical)
    if (direction === 'horizon') {
      const getWidth = R.compose(R.sum, R.map(R.add(hItemSpace)), R.slice(0, i))
      item.attr('transform', `translate(${getWidth(widths)}, 0)`)
      item.append('circle')
        .call(set('attr'), { cx: 0, cy: -0.3 * fontSize, r: circleR, fill: d.color })

      item.append('text')
        .call(set('attr'), {
          x: fontSize,
          y: 0,
          'font-size': `${fontSize}px`,
          fill: 'white',
          transform: 'translate(0, 0)'
        })
        .text(d.id)

      const itemBox = item.node().getBBox()
      widths[i] = itemBox.width

    } else if (direction === 'vertical') {
      item.attr('transform', `translate(0, ${i * ( fontSize + vItemSpace )})`)

      item.append('circle')
        .call(set('attr'), { cx: 0, cy: -0.3 * fontSize, r: circleR, fill: d.color })

      item.append('text')
        .call(set('attr'), {
          x: fontSize,
          y: 0,
          'font-size': `${fontSize}px`,
          fill: 'white',
          transform: 'translate(0, 0)'
        })
        .text(d.id)
    }

    // add events
    item
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)

    function mouseOver(e) {
      const el = this
      context.selectAll('.legend-item').style('opacity', 0.5)
      d3.select(el).style('opacity', 1)
      events.mouseover && events.mouseover(el, d)
    }

    function mouseOut(e) {
      const el = this
      context.selectAll('.legend-item').style('opacity', 1)
      events.mouseout && events.mouseout(el, d)
    }

  })

  legendNode.attr('transform', () => {
    const { x, y, boxSize } = getBaseCoord(legendNode, {
      pos, direction, width, height, margin,
      dim, circleR, widthBoxSizing
    })
    overlay.call(set('attr'), { width: boxSize.width, height: boxSize.height })
    callback && callback(boxSize)
    return `translate(${x + dx}, ${y + dy})`
  })

}

export default genLegend
