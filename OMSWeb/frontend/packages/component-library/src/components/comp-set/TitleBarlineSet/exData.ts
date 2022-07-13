import * as R from 'ramda'
import normaltr from './exNormaltrStats'
import alarm from './exAlarmStats'

const emptyData = {
	pageVariant: 'normaltr',
	stats: [
		{
			variant: 'simple',
			data: {
				value: '',
			},
		},
		{
			variant: 'detail',
			data: {
				value: '',
			},
		},
		{
			variant: 'detail',
			data: {
				value: '',
			},
		},
	],
	data: {
		duration: [],
		vehicle: [],
		source: [],
		dest: [],
		alarm: [],
		point: [],
	},
}

const lens = R.lens(R.prop('pageVariant'), R.assoc('pageVariant'))

export const exEmptyData = {
	normaltr: R.set(lens, 'normaltr')(emptyData),
	alarm: {
		stats: [
			{
				variant: 'simple',
				data: {
					value: '',
				},
			},
			{
				variant: 'detail',
				data: {
					value: '',
				},
			},
			{
				variant: 'detail',
				data: {
					value: '',
				},
			},
		],
		data: {
			duration: [],
			vehicle: [],
			alarm: [],
			point: [],
		},
	},
}

export const exPlaceholderData = {
	normaltr: R.set(lens, 'normaltr')(emptyData),
	alarm: R.set(lens, 'alarm')(emptyData),
}

export const exStatData = {
	normaltr,
	alarm,
}
