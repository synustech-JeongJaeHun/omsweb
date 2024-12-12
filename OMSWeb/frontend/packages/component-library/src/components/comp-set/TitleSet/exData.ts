import { numberWithCommas } from '@synusdev/shared'

export const exData = [
	{
		variant: 'simple',
		data: {
			title: '총 반송량',
			value: '63,000',
			unit: '개',
		},
	},
	{
		variant: 'detail',
		data: {
			title: '기간별 평균 반송량',
			subLabel: '시간당',
			value: 21.61,
			unit: '개',
			details: [
				{
					label: '연간',
					value: numberWithCommas(63300),
				},
				{
					label: '월별',
					value: numberWithCommas(15825),
				},
				{
					label: '주간',
					value: numberWithCommas(3516),
				},
				{
					label: '일별',
					value: numberWithCommas(518),
				},
			],
		},
	},
	{
		variant: 'detail',
		data: {
			title: '소요시간',
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

export const exEmptyData = [
	{
		variant: 'simple',
		data: {
			title: '총 반송량',
			value: '',
			unit: '개',
		},
	},
	{
		variant: 'detail',
		data: {
			title: '기간별 평균 반송량',
			subLabel: '시간당',
			value: '',
			unit: '개',
			details: [
				{
					label: '연간',
					value: '',
				},
				{
					label: '월별',
					value: '',
				},
				{
					label: '주간',
					value: '',
				},
				{
					label: '일별',
					value: '',
				},
			],
		},
	},
	{
		variant: 'detail',
		data: {
			title: '소요시간',
			subLabel: '평균',
			value: '',
			unit: '',
			details: [
				{
					label: '최대',
					value: '',
				},
				{
					label: '최소',
					value: '',
				},
				{
					label: '편차',
					value: '',
				},
			],
		},
	},
]
