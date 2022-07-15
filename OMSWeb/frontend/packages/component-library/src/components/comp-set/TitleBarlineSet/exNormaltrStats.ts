import { numberWithCommas } from '@daimre/shared'

const exStats = [
	{
		variant: 'simple',
		data: {
			title: 'Total TR',
			value: '63,000',
			unit: 'ea',
		},
	},
	{
		variant: 'detail',
		data: {
			title: 'Avg TR by Duration',
			subLabel: 'per hour',
			value: 21.61,
			unit: 'ea',
			details: [
				{
					label: 'yearly',
					value: numberWithCommas(63300),
				},
				{
					label: 'monthly',
					value: numberWithCommas(15825),
				},
				{
					label: 'weekly',
					value: numberWithCommas(3516),
				},
				{
					label: 'daily',
					value: numberWithCommas(518),
				},
			],
		},
	},
	{
		variant: 'detail',
		data: {
			title: 'Elapsed Time',
			subLabel: 'avg',
			value: '40m 13s',
			unit: '',
			details: [
				{
					label: 'max',
					value: '79m 10s',
				},
				{
					label: 'min',
					value: '34s',
				},
				{
					label: 'devn',
					value: '78m 36s',
				},
			],
		},
	},
]

export default exStats
