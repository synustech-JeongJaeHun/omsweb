import Highcharts from 'highcharts'

const dic = {
	name: {},
	conveyance: {
		series: {
			name: '반송량',
			type: 'column',
			yAxis: 1,
			color: '#4F96CC',
			tooltip: {
				valueSuffix: '개',
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
			name: '평균반송시간',
			type: 'spline',
			color: '#FF0000',
			tooltip: {
				valueSuffix: '시간',
			},
		},
		yAxis: {
			labels: {
				enabled: true,
				format: '{value}개',
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
			name: '알람수',
			type: 'column',
			yAxis: 1,
			color: '#4F96CC',
			tooltip: {
				valueSuffix: '개',
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
			name: '평균시간',
			type: 'spline',
			color: '#FF0000',
			tooltip: {
				valueSuffix: '시간',
			},
		},
		yAxis: {
			labels: {
				enabled: true,
				format: '{value}개',
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
