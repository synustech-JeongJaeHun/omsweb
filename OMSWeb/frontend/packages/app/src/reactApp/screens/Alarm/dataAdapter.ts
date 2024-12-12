import * as R from 'ramda'
import { numberWithCommas, convertEpochToStr, convertSimpleEpochToStr } from '@synusdev/shared'

const convertTimeStr = (val) => {
	const dic = {
		_: '일',
		h: '시간',
		m: '분',
		s: '초',
	}
	const arr = R.split(' ', val)

	return arr
		.reduce((acc, item) => {
			const num = Number(item.slice(0, 2))
			const char = item.slice(-1)

			if (num !== 0) {
				acc.push(`${num}${dic[char]}`)
			}

			return acc
		}, [])
		.join(' ')
}

const stats = (data) => {
	const { total, time, avg } = data

	const totalconv = {
		variant: 'simple',
		data: {
			title: 'Total Alarm',
			value: numberWithCommas(total),
			unit: 'ea',
		},
	}

	const convByDuration = {
		variant: 'detail',
		data: {
			title: 'Avg Alarm by Duration',
			subLabel: 'per hour',
			value: avg.ph,
			unit: 'ea',
			details: [
				{
					label: 'yearly',
					value: numberWithCommas(avg.yearly),
				},
				{
					label: 'monthly',
					value: numberWithCommas(avg.monthly),
				},
				{
					label: 'weekly',
					value: numberWithCommas(avg.weekly),
				},
				{
					label: 'daily',
					value: numberWithCommas(avg.daily),
				},
			],
		},
	}

	const convTime = {
		variant: 'detail',
		data: {
			title: 'Time Under Alarm',
			subLabel: 'avg',
			value: convertSimpleEpochToStr(time.avg),
			unit: '',
			details: [
				{
					label: 'max',
					value: convertSimpleEpochToStr(time.max),
				},
				{
					label: 'min',
					value: convertSimpleEpochToStr(time.min),
				},
				{
					label: 'devn',
					value: convertSimpleEpochToStr(time.devn),
				},
			],
		},
	}

	return [totalconv, convByDuration, convTime]
}

const charts = (data) => {
	const keys = R.keys(data)

	const convertA = (list) => {
		return list.map((item) => {
			const { label, count, avg } = item
			const temp = R.test(/-/g, label) ? label.slice(5) : label
			return [temp, count, R.defaultTo(0)(avg)]
		})
	}
	const convertB = (list, section) => {
		return list.map((item) => {
			const { label, count, avg, alias } = item
			return [label, count, R.defaultTo(0)(avg), alias]
		})
	}

	return keys.reduce((acc, item) => {
		const arr = data[item]
		if (item === 'duration') {
			acc[item] = convertA(arr)
		} else {
			acc[item] = convertB(arr, item)
		}

		return acc
	}, {})
}

export default { stats, charts }
