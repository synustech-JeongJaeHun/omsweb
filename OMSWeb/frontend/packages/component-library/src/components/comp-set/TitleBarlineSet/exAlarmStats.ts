import { numberWithCommas } from '@daimre/shared'

const exStats = [
	{
		variant: 'simple',
		data: {
			title: '총 알람',
			value: '100',
			unit: '개',
		},
	},
	{
		variant: 'detail',
		data: {
			title: '기간별 평균 발생',
			subLabel: '시간당',
			value: 0.03,
			unit: '개',
			details: [
				{
					label: '연간',
					value: numberWithCommas(100),
				},
				{
					label: '월별',
					value: numberWithCommas(25),
				},
				{
					label: '주간',
					value: numberWithCommas(6.25),
				},
				{
					label: '일별',
					value: numberWithCommas(0.89),
				},
			],
		},
	},
	{
		variant: 'detail',
		data: {
			title: '발생시간',
			subLabel: '평균',
			value: '9분 30초',
			unit: '',
			details: [
				{
					label: '최대',
					value: '16분 49초',
				},
				{
					label: '최소',
					value: '3분 10초',
				},
				{
					label: '편차',
					value: '5분 15초',
				},
			],
		},
	},
]

export default exStats
