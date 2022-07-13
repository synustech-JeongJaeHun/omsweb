import { useRef, useEffect, useState, useCallback } from 'react'
import * as R from 'ramda'
import { useImmer } from 'use-immer'
import { anyTrueEquals } from '../utils/common'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'

export function useInterval(
	cb: () => void,
	interval = 1000,
	enabled = true,
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

export const useWindowResizeEvent = (cb, cond = []) => {
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

const getInitValue = (num, interval, value) => {
	const now = Date.now()

	return R.times((idx) => {
		return [now - (num - idx) * interval, value, false]
	}, num)
}

export const useSelfUpdatedData = (range, interval) => {
	const num = range / interval
	const [list, updateList] = useState([])
	const [isFirst, updateFlag] = useState(true)

	const _updateList = useCallback(
		(data) => {
			let arr = []
			const now = Date.now()
			if (isFirst) {
				arr = getInitValue(num, interval, data)
				updateFlag(false)
			} else {
				const concatedList = [...list, [now, data, true]]
				arr = concatedList.slice(-1 * num)
			}

			updateList(arr)
		},
		[list, isFirst],
	)

	return [list, _updateList]
}

export const useCount = () => {
	const [count, updateCount] = useState(0)
	const inc = useCallback(() => {
		updateCount(count + 1)
	}, [count])

	return [count, inc]
}
