import { useRef, useEffect } from 'react'
import { useImmer } from 'use-immer'
import { anyTrueEquals } from '../utils/common'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'

export function useInterval(
  cb: () => void,
  interval = 1000,
	enabled = true
): void {
  const savedCB = useRef(() => {})

  useEffect(() => {
    savedCB.current = cb
  })

  useEffect(() => {
		let id
		if (enabled) {
			const tick = () => {
				savedCB.current()
			}
			id = setInterval(tick, interval)
		} else {
			clearInterval(id)
		}
    return () => clearInterval(id)
  }, [enabled])
}

type windowSize = {
  width: string
  height: string
}

export function useWindowSize(): windowSize {
  const [size, updateSize] = useImmer({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    const handleResize = () => {
      updateSize((draft) => {
        draft.width = window.innerWidth
        draft.height = window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  })

  return size
}

export const useWindowResizeEvent = (cb, cond=[]) => {

  useEffect(() => {
    const handleResize = () => {
      if (cb) {
        const _cb = debounce(cb, 400)
        _cb()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, cond)
}


export function useEffectOnce(fn, list) {
  const refs = useRef([])

  useEffect(() => {
    if (
      refs.current.length !== list.length ||
      anyTrueEquals(refs.current, list)
    ) {
      fn()
      refs.current = list
    }
  }, list)
}
