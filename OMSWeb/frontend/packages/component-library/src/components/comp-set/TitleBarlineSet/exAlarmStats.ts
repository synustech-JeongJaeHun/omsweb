import { numberWithCommas } from '@synusdev/shared'

const exStats = [
	{
		variant: 'simple',
		data: {
			title: 'Total Alarm',
			value: '100',
			unit: 'ea',
		},
	},
	{
		variant: 'detail',
		data: {
			title: 'Avg Alarm by Duration',
			subLabel: 'per hour',
			value: 0.03,
			unit: 'ea',
			details: [
				{
					label: 'yearly',
					value: numberWithCommas(100),
				},
				{
					label: 'monthly',
					value: numberWithCommas(25),
				},
				{
					label: 'weekly',
					value: numberWithCommas(6.25),
				},
				{
					label: 'daily',
					value: numberWithCommas(0.89),
				},
			],
		},
	},
	{
		variant: 'detail',
		data: {
			title: 'Time Under Alarm',
			subLabel: 'avg',
			value: '112m 48s',
			unit: '',
			details: [
				{
					label: 'max',
					value: '1122m 29s',
				},
				{
					label: 'min',
					value: '0',
				},
				{
					label: 'devn',
					value: '1122m 29s',
				},
			],
		},
	},
]

export default exStats
