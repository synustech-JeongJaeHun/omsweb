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
				valueSuffix: ' ea',
			},
		},
		yAxis: {
			// Secondary yAxis
			title: {
				text: null,
			},
			labels: {
				enabled: true,
				format: '{value}s',
				style: {
					color: Highcharts.getOptions().colors[1],
				},
			},
			opposite: true,
      allowDecimals: false,
		},
	},
	avgConveyance: {
		series: {
			name: 'avg TR time(s)',
			type: 'spline',
			color: '#FF0000',
			tooltip: {
				valueSuffix: ' sec',
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
      allowDecimals: false,
		},
	},
	alarmNum: {
		series: {
			name: 'alarm count',
			type: 'column',
			yAxis: 1,
			color: '#4F96CC',
			tooltip: {
				valueSuffix: ' ea',
			},
		},
		yAxis: {
			// Secondary yAxis
			title: {
				text: null,
			},
			labels: {
				enabled: true,
				format: '{value}s',
				style: {
					color: Highcharts.getOptions().colors[1],
				},
			},
			opposite: true,
      allowDecimals: false,
		},
	},
	avgHour: {
		series: {
			name: 'avg time under alarm(s)',
			type: 'spline',
			color: '#FF0000',
			tooltip: {
				valueSuffix: ' sec',
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
      allowDecimals: false,
		},
	},
  alias: {
    series: {
      name: 'alias',
      type: 'column',
      visible: false
    },
    yAxis: {

    },
  },
}

export default dic
