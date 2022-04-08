/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable no-empty-pattern */
// @ts-nocheck
import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import NoDataToDisplay from 'highcharts/modules/no-data-to-display'
import { calcColor5Reversed, isNotFullEmpty } from '@daimre/shared'

type AnyFuncType = (value: any) => any

const Wrapper = styled.div`
	/* width: 200px; */
	/* .highcharts-title {
    display: block;
  } */
	margin-bottom: -15px;
`

const colorDic = {
	error: {
		label: 'Error',
		color: '#49B2F5',
	},
	idle: {
		label: 'Idle',
		color: '#E85950',
	},
	manual: {
		label: 'Manual',
		color: '#000000',
	},
	auto: {
		label: 'Auto',
		color: '#F8C63A',
	},
	loading: {
		label: 'Loading',
		color: '#6BA69D',
	},
	unloading: {
		label: 'Unloading',
		color: '#81B6DA',
	},
}

const exData = [
	['error', 30],
	['idle', 20],
	['manual', 50],
	['auto', 200],
]

const genSeries = (_data) => {
	const data = _data.map(([key, value]) => {
		const { label, color } = colorDic[key]
		return {
			name: label,
			color,
			y: value,
		}
	})

	return [
		{
			type: 'pie',
			name: null,
			innerSize: '60%',
			animation: false,
			data,
		},
	]
}
const getOptions = (data) => {
	const series = isNotFullEmpty(data)
		? genSeries(data)
		: [
				{
					type: 'pie',
					name: 'Random data',
					data: [],
				},
		  ]

	// prettier-ignore
	const sum = R.compose(
		R.toString,
		R.sum,
		R.pluck(1)
	)(data)

	return {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: 0,
			plotShadow: false,
			width: 320,
			height: 200,
			marginBottom: 0,
			marginTop: 0,
			marginLeft: 0,
			marginRight: 0,
		},
		title: {
			text: sum,
			verticalAlign: 'middle',
			// align: 'center',
			style: {
				fontSize: '20px',
				color: '#1A1A1A',
				fontFamily: 'NS',
				fontWeight: 'bold',
			},
			x: -60,
			y: 20,
		},
		lang: {
			noData: '데이타가 없습니다',
		},
		exporting: {
			enabled: false,
		},
		credits: {
			enabled: false,
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
		},
		accessibility: {
			point: {
				valueSuffix: '%',
			},
		},
		legend: {
			enabled: true,
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'middle',
			symbolRadius: 0,
			itemMarginBottom: 10,
			itemStyle: {
				color: '#6A6A6A',
				fontFamily: 'NS',
				fontWeight: 'regular',
			},
			labelFormatter: function () {
				return `
					<div>
						<span style='padding-right: 20px'>${this.name}</span>
						<span> - </span>
						<span style='font-weight: bold;'>${this.y}</span>
					</div>
				`
			},
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: false,
				},
				showInLegend: true,
				size: 160,
				center: [80, '50%'],
				shadow: false,
				borderWidth: 0,
			},
			series: {
				enableMouseTracking: false,
			},
		},
		series,
	}
}


const getPlaceholderOpt = () => {

	return {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: 0,
			plotShadow: false,
			width: 320,
			height: 200,
			marginBottom: 0,
			marginTop: 0,
			marginLeft: 0,
			marginRight: 0,
		},
		title: {
			text: '데이타...',
			verticalAlign: 'middle',
			// align: 'center',
			style: {
				fontSize: '14px',
				color: 'rgba(0, 0, 0, 0.4)',
				fontFamily: 'NS',
				fontWeight: 'bold',
			},
			x: -60,
			y: 15,
		},
		lang: {
			noData: '데이타가 없습니다',
		},
		exporting: {
			enabled: false,
		},
		credits: {
			enabled: false,
		},
		tooltip: {
			enabled: false
		},
		accessibility: {
			point: {
				valueSuffix: '%',
			},
		},
		legend: {
			enabled: false
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: false,
				},
				showInLegend: false,
				size: 160,
				center: [80, '50%'],
				shadow: false,
				borderWidth: 0,
			},
			series: {
				enableMouseTracking: false,
			},
		},
		series: [
			{
				type: 'pie',
				name: null,
				innerSize: '60%',
				animation: false,
				data: [
					{
						name: 'test',
						color: 'rgba(0, 0, 0, 0.1)',
						y: 10,
					},
				],
			},
		],
	}
}

NoDataToDisplay(Highcharts)
const Donut: React.FC<Props> = ({ data, isPlaceholder }: Props) => {
	const opt = isPlaceholder ? getPlaceholderOpt(): getOptions(data)

	return (
		<Wrapper>
			<HighchartsReact
				highcharts={Highcharts}
				options={opt} />
		</Wrapper>
	)
}

Donut.defaultProps = {
	data: exData,
	isPlaceholder: false
}

interface Props {
	data?: (string | number)[][]
	isPlaceholder?: boolean
}

export default Donut
