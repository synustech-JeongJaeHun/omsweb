import Highcharts from 'highcharts'

const dic = {
	name: {},
	conveyance: {
		series: {
			name: 'TR count',
			type: 'column',
			yAxis: 1,
			color: '#4F96CC',
			tooltip: {
				valueSuffix: 'ea',
			},
		},
		yAxis: {
			// Secondary yAxis
			title: {
				text: null,
			},
			labels: {
				enabled: true,
				format: '{value}h',
				style: {
					color: Highcharts.getOptions().colors[1],
				},
			},
			opposite: true,
		},
	},
	avgConveyance: {
		series: {
			name: 'avg TR time(s)',
			type: 'spline',
			color: '#FF0000',
			tooltip: {
				valueSuffix: 'hour',
			},
		},
		yAxis: {
			labels: {
				enabled: true,
				format: '{value}ea',
				style: {
					color: Highcharts.getOptions().colors[1],
				},
			},
			title: {
				text: null,
			},
		},
	},
	alarmNum: {
		series: {
			name: 'alarm count',
			type: 'column',
			yAxis: 1,
			color: '#4F96CC',
			tooltip: {
				valueSuffix: 'ea',
			},
		},
		yAxis: {
			// Secondary yAxis
			title: {
				text: null,
			},
			labels: {
				enabled: true,
				format: '{value}h',
				style: {
					color: Highcharts.getOptions().colors[1],
				},
			},
			opposite: true,
		},
	},
	avgHour: {
		series: {
			name: 'avg time under alarm',
			type: 'spline',
			color: '#FF0000',
			tooltip: {
				valueSuffix: 'hour',
			},
		},
		yAxis: {
			labels: {
				enabled: true,
				format: '{value}ea',
				style: {
					color: Highcharts.getOptions().colors[1],
				},
			},
			title: {
				text: null,
			},
		},
	},
}

export default dic
