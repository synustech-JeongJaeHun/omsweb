import * as React from 'react'
import { useRef, useState } from 'react'
import { useInterval } from './base'
import * as R from 'ramda'

const genPlaceholder = ({ data, height, isH }) => {

	return {
		chart: {
			// zoomType: 'xy',
			height,
			marginBottom: isH ? 77 : undefined,
			animatoin: {
				duration: 300
			}
		},
		title: {
			text: null,
		},
		subtitle: {
			text: null,
		},
		xAxis: {
			visible: false
		},
		lang: {
			noData: 'no data',
		},
		yAxis: {
			title: {
				text: null
			},
			labels: {
				enabled: false
			}
		},
		// tooltip: {
		// 	enabled: false
		// },
		legend: {
			enabled: false,
		},
		plotOptions: {
			series: {
				animation: {
					duration: 800
				}
			}
		},
		series: [
			{
				name: 'hello',
				type: 'column',
				color: 'rgba(0, 0, 0, 0.25)',
				data,
				// animation: false
			}
		],
	}
}

export const usePlaceholderData = ({ currentState = true, height, isH }) => {
	const arr = [
		[9, 12, 5, 7, 10, 11, 7, 9, 12, 5],
		[5, 3, 12, 4, 2, 4, 3, 2, 4, 1]
	]
	const dataA = isH ? R.take(6, arr[0]): arr[0]
	const dataB = isH ? R.take(6, arr[1]): arr[1]
	const defaultOpt = genPlaceholder({ data: dataA, height, isH })

	const cntRef = useRef(0)
	const [opt, updateOpt] = useState(defaultOpt)
	const [state, updateState] = useState(currentState)

	useInterval(() => {
		cntRef.current += 1
		const data = cntRef.current % 2 == 1 ? dataA: dataB
		const _opt = genPlaceholder({ data, height, isH })
		updateOpt(_opt)
	}, 800, state)

	return [opt, updateState]
}
