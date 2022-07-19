/**
 *
 * BarLineChart
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { dic } from '../shared'
import { usePlaceholderData } from '@daimre/shared'
import { useImmer } from 'use-immer'

type StyleType = {}

const Wrapper = styled.div``

const defaultSeries = {
	animation: false,
}

const getList = (data, limit) => {
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

	return { ...yList, categories, xKey, tbody }
}

const getOptions = ({
	height,
	rotation,
	limit = null,
	data,
	isH,
	onClick,
	variant,
}) => {
	const { categories, series, yAxis, tbody, xKey } = getList(data, limit)

	const handleClick = (e) => {
		const category = R.path(['point', 'category'], e)
		const ret = R.find(R.propEq(xKey, category), tbody)
		onClick &&
			onClick({
				key: variant,
				value: category,
				detail: ret,
			})
	}

	return {
		chart: {
			// zoomType: 'xy',
			height,
			marginBottom: isH ? 77 : undefined,
			animation: false,
		},
		title: {
			text: null,
		},
		subtitle: {
			text: null,
		},
		xAxis: [
			{
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
		],
		lang: {
			noData: 'no data',
		},
		yAxis,
		tooltip: {
			shared: true,
			enabled: true,
		},
		legend: {
			enabled: false,
		},
		plotOptions: {
			column: {
				maxPointWidth: 50,
				cursor: 'pointer',
				events: {
					click: handleClick,
				},
			},
			spline: {
				cursor: 'pointer',
				point: {
					events: {
						click: handleClick,
					},
				},
			},
			series: {
				animation: false,
			},
		},
		series,
	}
}

Highcharts.setOptions({
	lang: {
		thousandsSep: ',',
	},
})

// prettier-ignore
const Barline: React.FC<Props> = ({
	height,
	labelRotation,
	limit,
	data,
	isH,
	onClick,
	variant,
	isPlaceholder
}: Props) => {

	const ref = React.useRef<any>()
	const [placeholderOpt, updatePlaceholderState] = usePlaceholderData({
		currentState: isPlaceholder,
		height,
		isH
	})


	React.useEffect(() => {
		if (ref.current) {
			setTimeout(() => {
				ref.current.chart.reflow()
				// ref.current.chart.update({
				// 	chart: {
				// 		animation: true
				// 	}
				// })
			})
		}
	}, [])

	const currentOpt = isPlaceholder ? placeholderOpt : getOptions({
		height,
		rotation: labelRotation,
		limit,
		data,
		isH,
		onClick,
		variant
	})
	return (
		<Wrapper>
			<HighchartsReact
				ref={ref}
				highcharts={Highcharts}
				options={R.clone(currentOpt)} />
		</Wrapper>
	)
}

Barline.defaultProps = {
	height: 'auto',
	labelRotation: 45,
	limit: null,
	data: {
		header: [],
		body: [],
	},
	isH: false,
	onClick: () => {},
	variant: '',
	isPlaceholder: false,
}

interface Props {
	height?: number | string
	labelRotation?: number
	limit?: number | null
	isH?: boolean
	data?: {
		header: any[]
		body: any[]
	}
	onClick?: (values: any) => void
	variant?: string
	isPlaceholder?: boolean
}

export default Barline
