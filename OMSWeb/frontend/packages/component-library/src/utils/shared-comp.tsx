// @ts-nocheck
/** @jsxRuntime classic */
/** @jsx jsx */
import * as React from 'react'
import styled from '@emotion/styled'
import { css, jsx } from '@emotion/react'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
import { 
  useWindowResizeEvent, 
  useEffectOnce, 
  isFullEmpty, 
  isNotFullEmpty 
} from '@daimre/shared'
import Loader from '../components/Loader'


const WrapperInner = styled.div`
  position: relative;
  overflow: hidden;
  width: ${({ width }) => width};
  height: ${({ height }) => height};

  .loader-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    visibility: ${({ isFetching }) => isFetching ? 'visible' : 'hidden'}
  }

  .nodata-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
    background-color: #121724;
    visibility: ${({ isEmpty, isFetching }) => {
      if (isFetching) {
        return 'hidden'
      } else {
        return isEmpty ? 'visible': 'hidden'
      }
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.3);
  }

  .ref {
    width: 100%;
    height: 100%;
    position: relative;
    opacity: ${({ isFetching }) => isFetching ? 0 : 1}
  } 
`


const Wrapper = React.forwardRef(({ 
  width, 
  height, 
  children, 
  isFetching = false, 
  isEmpty = false
}, ref) => {
  width = typeof width === 'number' ? `${width}px`: width
  height = typeof height === 'number' ? `${height}px`: height
  
  return (
    <WrapperInner
      width={width} 
      height={height} 
      isFetching={isFetching} 
      isEmpty={isEmpty}>
      <div className='loader-wrapper'>
        <Loader />
      </div>
      <div className='nodata-wrapper'>데이타 없음</div>
      <div className='ref' ref={ref} />
    </WrapperInner>
  )
})
export const SVGContainer = ({ 
  func, 
  data, 
  width = 900, 
  height = 500 
}) => {
  const ref = React.useRef(null)

  React.useEffect(() => {
    const container = ref.current
    func({ container, data, width, height })
  }, [ref.current])

  return (
    <svg ref={ref} width={width} height={height} />
  )
}

export const SvgDivContainer = ({ 
  name,
  func, 
  data, 
  width = 900, 
  height = 500, 
  extra, 
  changable, 
  isFetching = false, 
}) => {
  const ref = React.useRef(null)
  const svgRef = React.useRef(null)

  React.useEffect(() => {
    if (ref.current !== null) {
      const container = ref.current
      setTimeout(() => {
        if (svgRef.current === null) {
          svgRef.current = func({ container, data, width, height, ...extra, ...changable })
        }
      }, 1)
    }
  }, [ref.current])

  useWindowResizeEvent(() => {
    if (svgRef.current !== null) {
      if (isFullEmpty(changable)) {
        svgRef.current.draw(data)
      } else {
        svgRef.current.draw(data, changable)
      }
    }
  }, [data, changable])

  React.useEffect(() => {
    if (svgRef.current !== null) {
      if (isFullEmpty(changable)) {
        svgRef.current.draw(data)
      } else {
        svgRef.current.draw(data, changable)
      }
    }
  }, [data, changable])

  const render = () => {
    const isEmpty = isFullEmpty(data)

    return <Wrapper 
      isFetching={isFetching} 
      width={width} 
      height={height} 
      ref={ref} 
      isEmpty={isEmpty} />
  }

  return render()
}

SvgDivContainer.defaultProps = {
  extra: {},
  changable: {}
}

export const SvgDivContainerSync = ({
  name,
  func,
  data,
  width = 900,
  height = 500,
  activeChart,
  callback,
  isFetching = false
}) => {
  const ref = React.useRef(null)
  const chartRef = React.useRef(null)
  // callback = throttle(callback, 100)

  React.useEffect(() => {
    if (ref.current !== null) {
      if (data) {
        const container = ref.current
        // setTimeout(() => {
        if (chartRef.current === null) {
          chartRef.current = func({
            container,
            name,
            data,
            width,
            height,
            callback: (chartObj) => {
              callback && callback(chartObj)
            }
          })
        }
        // }, 1)
      }
    }
  }, [data])

  React.useEffect(() => {
    const chart = chartRef.current
    chart && chart.setCurrentDate(activeChart)
  }, [activeChart])

  useWindowResizeEvent(() => {
    if (chartRef.current !== null) {
      chartRef.current.draw(data)
    }
  }, [data])

  useEffectOnce(() => {
    if (chartRef.current !== null) {
      chartRef.current.draw(data)
    }
  }, [data])

  const render = () => {
    const isEmpty = isFullEmpty(data)

    return <Wrapper 
      isFetching={isFetching} 
      width={width} 
      height={height} 
      ref={ref} 
      isEmpty={isEmpty} />
  }

  return render()
}

SvgDivContainerSync.defaultProps = {
  activeChart: {},
  callback: () => {}
}


export const useWindowResize = (cb, cond=[]) => {

  React.useEffect(() => {
    const handleResize = () => {
      cb && cb()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, cond)
}

export function useInterval(cb: () => void, interval = 1000): void {
  const savedCB = React.useRef(() => {})

  React.useEffect(() => {
    savedCB.current = cb
  })

  React.useEffect(() => {
    const tick = () => {
      savedCB.current()
    }
    const id = setInterval(tick, interval)
    return () => clearInterval(id)
  }, [])
}
