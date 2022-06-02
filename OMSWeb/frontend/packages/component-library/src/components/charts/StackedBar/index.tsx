/**
 *
 * StackedBar
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { usePlaceholderData } from '@daimre/shared'

type StyleType = {}

const Wrapper = styled.div``

const colors = [
	'#4C73C3',
	'#E27E3C',
	'#A4A5A7',
	'#F7C02D',
	'#669CD5',
	'#78AC4E',
	'#2B4578',
]

const getList = (data, limit) => {
	let { header: theader, body: tbody } = data
	tbody = limit !== null ? R.take(limit, tbody) : tbody
	const keys = R.pluck<string, any>('dataField', theader)
	const otherKeys = R.compose(R.keys, R.omit(keys), R.head)(tbody)
	const xKey = R.head(keys)

	const categories = R.pluck<string, any>(xKey, tbody)
	const values = otherKeys.reduce((acc, y, i) => {
		acc[y] = R.pluck<string, any>(y, tbody)
		return acc
	}, {})

	const otherList = otherKeys.reduce(
		(acc, y, i) => {
			const data = values[y]

			acc['series'].push({
				name: y,
				animation: false,
				data,
			})

			return acc
		},
		{
			series: [],
		},
	)

	return { ...otherList, categories, xKey, tbody }
}

const getOptions = ({ height, data, rotation, limit = null, showLegend }) => {
	const { categories, series, tbody, xKey } = getList(data, limit)

	return {
		chart: {
			type: 'column',
			height,
			marginRight: 30,
			marginBottom: showLegend ? 75 : 74,
			animation: true,
		},
		colors,
		title: {
			text: null,
		},
		subtitle: {
			text: null,
		},
		xAxis: {
			categories,
			crosshair: true,
			labels: {
				rotation,
				formatter: function () {
					if (this.value.length > 12) {
						return this.value.substring(0, 12) + '...'
					}
					return this.value
				},
			},
			visible: true,
		},
		lang: {
			noData: '데이타가 없습니다',
		},
		yAxis: {
			min: 0,
			title: {
				text: null,
			},
			stackLabels: {
				enabled: true,
			},
		},
		legend: {
			enabled: showLegend,
			align: 'center',
			x: 0,
			verticalAlign: 'bottom',
			symbolRadius: 0,
			y: 10,
			backgroundColor:
				Highcharts.defaultOptions.legend.backgroundColor || 'white',
			shadow: false,
		},
		tooltip: {
			headerFormat: '<b>{point.x}</b><br/>',
			pointFormat: '{series.name}: {point.y}<br/>총: {point.stackTotal}',
		},
		plotOptions: {
			column: {
				stacking: 'normal',
				maxPointWidth: 65,
				dataLabels: {
					enabled: true,
				},
			},
		},
		series,
	}
}

const StackedBar: React.FC<Props> = ({
	height,
	data,
	limit,
	showLegend,
	labelRotation,
	isPlaceholder,
}: Props) => {
	const ref = React.useRef<any>()
	const [placeholderOpt, updatePlaceholderState] = usePlaceholderData({
		currentState: isPlaceholder,
		height,
		isH: !showLegend,
	})

	React.useEffect(() => {
		if (ref.current) {
			setTimeout(() => {
				ref.current.chart.reflow()
			})
		}
	}, [])

	const currentOpt = isPlaceholder
		? placeholderOpt
		: getOptions({
				height,
				data,
				limit,
				showLegend,
				rotation: labelRotation,
		  })

	return (
		<Wrapper>
			<HighchartsReact ref={ref} highcharts={Highcharts} options={currentOpt} />
		</Wrapper>
	)
}

StackedBar.defaultProps = {
	height: 'auto',
	labelRotation: 45,
	showLegend: false,
	limit: null,
	data: {
		header: [],
		body: [],
	},
	isPlaceholder: false,
}

interface Props {
	height?: number | string
	labelRotation?: number
	showLegend?: boolean
	limit?: number | null
	data?: {
		header: any[]
		body: any[]
	}
	isPlaceholder?: boolean
}

export default StackedBar
