// @ts-nocheck
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
import { usePlaceholderData, isNotFullEmpty } from '@daimre/shared'

type StyleType = {}

const Wrapper = styled.div``

const defaultColors = {
	id_mismatch: '#4C73C3',
	id_read_fail: '#E27E3C',
	id_duplicate: '#A4A5A7',
	source_pio_timeout: '#F7C02D',
	dest_pio_timeout: '#669CD5',
	soruce_empty: '#78AC4E',
	double_storage: '#2B4578',
	abort: '#fff',
	cancel: '#fff',
	vehicle_error: '#fff',
}

const getList = (data, limit, colors, onClickLegend) => {
	let { header: theader, body: tbody } = data
	tbody = limit !== null ? R.take(limit, tbody) : tbody
  const colorKeys = R.keys(defaultColors)
  const keys = R.compose(R.pluck('dataField'), R.filter(R.propEq('visible', undefined)))(theader)
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
        id: y,
				name: y,
				animation: false,
				data: data.map((v, idx) => {
          return {
            y: v === 0 ? undefined : v,
            color: colors[y],
          }
				}),
				color: colors[y],
        legendIndex: R.indexOf(y, colorKeys),
        events: {
          legendItemClick: function() {
            onClickLegend && onClickLegend({
              name: this.name,
              visible: !this.visible,
            }, y)
            // return this.visible ? 'visible' : 'hidden';
          }
        }
			})

			return acc
		},
		{
			series: [],
		},
	)

	return { ...otherList, categories, xKey, tbody }
}

const getOptions = ({
	height,
	data,
	rotation,
	limit = null,
	showLegend,
	colors,
  onClickLegend
}) => {
	const { categories, series, tbody, xKey } = getList(data, limit, colors, onClickLegend)

	return {
		chart: {
			type: 'column',
			height,
			marginRight: 30,
			marginBottom: showLegend ? 75 : 74,
			animation: true,
		},
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
			noData: 'no data',
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

Highcharts.setOptions({
	lang: {
		thousandsSep: ',',
	},
})

const StackedBar: React.FC<Props> = ({
	height,
	data,
	limit,
	showLegend,
	labelRotation,
	isPlaceholder,
	colors,
  onClickLegend,
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

  React.useEffect(() => {
    if (data.body.length > 0) {
      // @ts-ignore
      updatePlaceholderState(false)
    }
  }, [data])

  const handleClickLegend = (values, id) => {
    onClickLegend && onClickLegend(values)

    if (ref.current) {
      ref.current.chart.redraw()
		}
  }

	const currentOpt = isPlaceholder
		? placeholderOpt
		: getOptions({
				height,
				data,
				limit,
				showLegend,
				rotation: labelRotation,
				colors,
        onClickLegend: handleClickLegend
		  })

	return (
		<Wrapper>
			<HighchartsReact
        ref={ref}
        highcharts={Highcharts}
        options={currentOpt} />
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
	colors: defaultColors,
  onClickLegend: () => {}
}

export interface Props {
	height?: number | string
	labelRotation?: number
	showLegend?: boolean
	limit?: number | null
	data?: {
		header: any[]
		body: any[]
	}
	isPlaceholder?: boolean
	colors?: any
  onClickLegend?: (data: any) => void
}

export default StackedBar
