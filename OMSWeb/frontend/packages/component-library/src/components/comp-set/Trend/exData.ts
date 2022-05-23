import * as R from 'ramda'

const exTableData = [
	[
		{
			label: 'Range',
			value: '2021-09-06 09:05:24(1)~2021-09-06 09:15:24(10,367)',
		},
	],
	[
		{
			label: 'Utilization',
			value: '67.78%',
		},
	],
	[
		{
			label: 'Delivery Time (created ~ completed)',
			value: '87.10s, order count: 10,191',
		},
	],
	[
		{
			label: 'Wait Time (created ~ loaded)',
			value: '29.28s, order count: 10,310',
		},
	],
	[
		{
			label: 'Transfer time (loaded ~ completed)',
			value: '57.84s, order count: 10,191',
		},
	],
	[
		{
			label: 'Assign time (created ~ assigned)',
			value: '1.84s, order count: 10,191',
		},
	],
	[
		{
			label: 'Order Change',
			value: '65.61% (6,792/10,368)',
		},
	],
	[
		{
			label: 'Number of order requests',
			value: 'per second: 2.0011, estimated per day: 172,894',
		},
	],
]

const exStats = [
	{
		title: 'Delivery Time',
		value: '87.10',
		unit: 'sec'
	},
]

export const exData = {
	stats: [...exStats],
	table: [...exTableData],
	donuts: [
		[
			['error', 30],
			['idle', 20],
			['manual', 50],
			['auto', 200],
		],
		[
			['unloading', 80],
			['loading', 120],
		]
	]
}


const lens = R.lens(R.prop('value'), R.assoc('value'));
const map = R.map(R.set(lens, ''))

export const exEmptyData = {
	stats: map(exStats),
	table: R.map(map, exTableData),
	donuts: [
		[],
		[]
	]
}

export const exPlaceholderData = {
	stats: R.repeat({value: ''}, 4),
	table: [],
	donuts: [[], []]
}
