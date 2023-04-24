import * as R from 'ramda'
import { convertEpochToStr } from '@daimre/shared'
import { format } from 'date-fns/fp'

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

const exStats = {
	cpu: {},
	memory: {},
}

export const exData = {
	stats: exStats,
	table: [...exTableData],
	donuts: [
		[
			['error', 30],
			['idle', 20],
			['disconnected', 50],
			['auto', 200],
		],
		[
			['unloading', 80],
			['loading', 120],
      ['moving', 80],
      ['idle', 120],
		],
	],
}

const lens = R.lens(R.prop('value'), R.assoc('value'))
const map = R.map(R.set(lens, ''))

export const exEmptyData = {
	stats: exStats,
	table: R.map(map, exTableData),
	donuts: [[], []],
}

export const exPlaceholderData = {
	stats: exStats,
	table: [],
	donuts: [[], []],
}

const dateForm = format('yyyy-MM-dd HH:mm:ss')

const makeTable = (data) => {
	const {
		range,
		utilization,
		delivery_time,
		wait_time,
		transfer_time,
		assign_time,
		number_of_order_request,
	} = data

	return [
		[
			{
				label: 'Range',
				value: `${dateForm(range['before_time'])}~${dateForm(
					range['current_time'],
				)}(${range['count']})`,
			},
		],
		[
			{
				label: 'Utilization',
				value: `${utilization['value']}%`,
			},
		],
		[
			{
				label: 'Delivery Time (created ~ completed)',
				value: `${convertEpochToStr(delivery_time['value'])}, order count: ${
					delivery_time['count']
				}`,
			},
		],
		[
			{
				label: 'Wait Time (created ~ loaded)',
				value: `${convertEpochToStr(wait_time['value'])}, order count: ${
					wait_time['count']
				}`,
			},
		],
		[
			{
				label: 'Transfer time (loaded ~ completed)',
				value: `${convertEpochToStr(transfer_time['value'])}, order count: ${
					transfer_time['count']
				}`,
			},
		],
		[
			{
				label: 'Assign time (created ~ assigned)',
				value: `${convertEpochToStr(assign_time['value'])}, order count: ${
					assign_time['count']
				}`,
			},
		],
		// [
		//   {
		//     label: 'Order Change',
		//     value: '65.61% (6,792/10,368)',
		//   },
		// ],
		[
			{
				label: 'Number of order requests',
				value: `per second: ${number_of_order_request['value']}, estimated per day: ${number_of_order_request['count']}`,
			},
		],
	]
}

const makeDonut = (data) => {
	const { vehicles, loading_unloading: lu } = data

	return [
		[
			['error', vehicles['error']],
			['disconnected', vehicles['disconnected']],
			['manual', vehicles['manual']],
			['auto', vehicles['auto']],
		],
		[
			['unloading', lu['unloading']],
			['loading', lu['loading']],
      ['moving', lu['moving']],
      ['idle', lu['idle']]
		],
	]
}

const makeStats = (data) => {
	const { cpu, memory } = data
	return { cpu, memory }
}

export const makeData = (data) => ({
	stats: makeStats(data),
	table: makeTable(data),
	donuts: makeDonut(data),
})
