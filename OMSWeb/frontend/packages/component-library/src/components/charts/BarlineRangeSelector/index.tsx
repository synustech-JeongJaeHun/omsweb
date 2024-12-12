/**
 *
 * StackedBar
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@synusdev/styles'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import { dic } from '../shared'

type StyleType = {}

const Wrapper = styled.div``

const defaultSeries = {
	animation: false,
}

const getList = (data, limit = null) => {
	let { header: theader, body: tbody } = data
	tbody = limit !== null ? R.take(limit, tbody) : tbody
	const keys = R.pluck<string, any>('dataField', theader)
	const xKey = R.head(keys)
	const yKeys = R.tail(keys)

	const categories = R.pluck<string, any>(xKey, tbody)
	const values = yKeys.reduce((acc, y, i) => {
		acc[y] = R.pluck<string, any>(y, tbody)
		return acc
	}, {})

	const yList = yKeys.reduce(
		(acc, y, i) => {
			const data = values[y]
			const serie = dic[y]['series']
			const yAxis = dic[y]['yAxis']

			acc['series'].push({ ...serie, ...defaultSeries, data })
			acc['yAxis'].push(yAxis)

			return acc
		},
		{
			yAxis: [],
			series: [],
		},
	)

	return { ...yList, categories }
}

const getOptions = (data, isTimeseries) => {
	const { categories, series, yAxis } = getList(data)
	const maxLength = categories.length - 1 >= 20 ? 20 : categories.length - 1

	const formatter = function () {
		if (this.value.length > 12) {
			return this.value.substring(0, 12) + '...'
		}
		return this.value
	}

	const timeObj = isTimeseries
		? {
				xAxis: {
					categories,
					crosshair: true,
					labels: {
						rotation: 45,
						formatter,
					},
				},
				scrollbar: {
					enabled: false,
				},
		  }
		: {}

	return {
		chart: {
			alignTicks: false,
		},

		rangeSelector: {
			// selected: 1,
			enabled: false,
		},

		legend: {
			enabled: false,
		},

		xAxis: {
			min: 0,
			max: maxLength,
			categories,
			crosshair: true,
			labels: {
				rotation: 45,
				formatter,
			},
		},

		yAxis,

		title: {
			text: null,
		},

		tooltip: {
			shared: true,
		},

		scrollbar: {
			enabled: maxLength >= 20,
		},
		...timeObj,
		series,
	}
}

Highcharts.setOptions({
	lang: {
		thousandsSep: ',',
	},
})


const BarlineRangeSelector: React.FC<Props> = ({
	data,
	isTimeseries,
}: Props) => {
	const ref = React.useRef<any>()

	React.useEffect(() => {
		if (ref.current) {
			ref.current.chart.reflow()
		}
	}, [])

	const options = getOptions(data, isTimeseries)

	return (
		<Wrapper>
			<HighchartsReact
				ref={ref}
				highcharts={Highcharts}
				// constructorType={'stockChart'}
				options={options}
			/>
		</Wrapper>
	)
}

BarlineRangeSelector.defaultProps = {
	data: {
		header: [],
		body: [],
	},
	isTimeseries: false,
}

interface Props {
	data?: {
		header: any[]
		body: any[]
	}
	isTimeseries?: boolean
}

export default BarlineRangeSelector
