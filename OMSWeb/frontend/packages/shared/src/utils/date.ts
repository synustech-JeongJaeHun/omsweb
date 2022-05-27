import moment from 'moment'
import {
	isSameMonth,
	startOfMonth,
	endOfMonth,
	format,
	differenceInMonths,
	add,
	isSameDay,
	intervalToDuration,
} from 'date-fns/fp'
import * as R from 'ramda'

const timeDic = {
	years: 60 * 60 * 24 * 30 * 12,
	months: 60 * 60 * 24 * 30,
	days: 60 * 60 * 24,
	hours: 60 * 60,
	minutes: 60 * 1,
	seconds: 1,
}

export const beforeDay = (days) => moment().startOf('day').subtract(days, 'day')
export const afterDay = (days) => moment().startOf('day').add(days, 'day')

export const bdFormat = (days) => beforeDay(days).format('YYYY-MM-DD')
export const adFormat = (days) => afterDay(days).format('YYYY-MM-DD')

const getDiffMonth = (start, end) => {
	const dateFormY = format('yyyy')
	const dateFormM = format('MM')
	const arr = [start, end]
	const [startY, endY] = arr.map(dateFormY).map(Number).map(R.multiply(12))
	const [startM, endM] = arr.map(dateFormM).map(Number)
	return endY + endM - (startY + startM)
}

type getDurationStr = (start: string, end: string) => string[][]
export const getDurationStr: getDurationStr = (_start, _end) => {
	const startEnd = R.map(Date.parse, [_start, _end])
	const [start, end] = startEnd
	const dateFormYMD = format('yyyy-MM-dd')
	const dateFormM = format('M')
	const makeDateForms = R.map(dateFormYMD)

	const monthDiff = getDiffMonth(start, end)
	const sameMonth = isSameMonth(start, end)
	const getMonthList = (mDiff) => {
		const startMonth = R.compose(Number, dateFormM)(start)
		const getValue = (value) => ((startMonth + value) % 12) + 1
		return R.pipe(R.times(getValue), R.prepend(startMonth))(mDiff)
	}

	if (sameMonth) {
		return [makeDateForms(startEnd)]
	}

	if (monthDiff < 2) {
		const firstMon = [start, endOfMonth(start)]
		const endMon = [startOfMonth(end), end]
		return [makeDateForms(firstMon), makeDateForms(endMon)]
	}

	// 2개월 이상 차이 나는 경우
	const mList = getMonthList(monthDiff)
	return mList.map((mon, idx) =>
		R.cond([
			[R.equals(0), () => makeDateForms([start, endOfMonth(start)])],
			[
				R.equals(mList.length - 1),
				() => makeDateForms([startOfMonth(end), end]),
			],
			[
				R.T,
				() => {
					const temp = add({ months: idx }, start)
					return makeDateForms([startOfMonth(temp), endOfMonth(temp)])
				},
			],
		])(idx),
	)
}

type getDurationLabel = (arr: [string, string]) => {
	label: string
	startStr: string
	endStr: string
}
export const getDurationLabel: getDurationLabel = (arr) => {
	const dateFormM = format('M월')
	const dateFormd = format('d')
	const [start, end] = R.map(Date.parse, arr)

	const month = dateFormM(start)
	const startDay = dateFormd(start)
	const endDay = dateFormd(end)
	const isSameStart = isSameDay(startOfMonth(start), start)
	const isSameEnd = isSameDay(endOfMonth(end), end)
	const label =
		isSameStart && isSameEnd ? month : `${month}(${startDay}~${endDay})`

	return {
		label,
		startStr: arr[0],
		endStr: arr[1],
	}
}

// ('4월(15~20)', '2022') => ['2022-4-15', '2022-4-20']
type getStrToStartEnd = (label: string, year: string) => [string, string]
export const getStrToStartEnd: getStrToStartEnd = (label, year) => {
	const dateFormyyyyMMdd = format('yyyy-MM-dd')

	if (R.test(/\(/, label)) {
		const [month, last] = R.split('월', label)
		return R.compose(
			R.map((day) => `${year}-${month}-${day}`),
			R.split('~'),
			R.replace(/(\(|\))/g, ''),
		)(last)
	}

	const month = R.replace('월', '', label)
	const start = `${year}-${month}-01`
	const end = R.compose(dateFormyyyyMMdd, endOfMonth, Date.parse)(start)

	return [start, end]
}

type convertDurationLabel = (label: string, year: string) => string
export const convertDurationLabel: convertDurationLabel = (label, year) =>
	R.join('_', getStrToStartEnd(label, year))

// ('2015-03-11', '2022-04-12') => 220406400
type getEpoch = (start: string, end: string) => number
export const getEpoch: getEpoch = (start, end) => {
	const obj = { start, end }
	const intervals = R.compose(intervalToDuration, R.map(Date.parse))(obj)

	return R.compose(
		R.reduce((acc, key) => {
			const value = intervals[key]
			acc += value * timeDic[key]
			return acc
		}, 0),
		R.keys,
	)(intervals)
}

const dateLabel = {
	ko: {
		years: '년',
		months: '개월',
		days: '일',
		hours: '시간',
		minutes: '분',
		seconds: '초',
	},
}

// (220406400) => '7년 1개월 1일'
type convertEpochToStr = (
	epoch: number,
	opt?: {
		years?: string
		months?: string
		days?: string
		hours?: string
		minutes?: string
		seconds?: string
	},
) => string
export const convertEpochToStr: convertEpochToStr = (epoch, opt = {}) => {
	const defaultLabels = {
		years: 'y',
		months: 'M',
		days: 'd',
		hours: 'h',
		minutes: 'm',
		seconds: 's',
	}

	const labels = { ...defaultLabels, ...opt }

	const arr = []
	const pushAndCalc = (value, timeVariant, func = (value) => {}) => {
		const ret = Math.floor(value / timeDic[timeVariant])
		const unit = labels[timeVariant]
		arr.push(`${ret}${unit}`)
		const rest = value % timeDic[timeVariant]
		return func(rest)
	}

	const calc = (value) => {
		const func = (timeVariant) => (_value) =>
			pushAndCalc(_value, timeVariant, calc)
		const gtLte = (gt, lte) =>
			R.allPass([R.gt(timeDic[gt]), R.lte(timeDic[lte])])

		return R.cond([
			[R.lte(timeDic['years']), func('years')],
			[gtLte('years', 'months'), func('months')],
			[gtLte('months', 'days'), func('days')],
			[gtLte('days', 'hours'), func('hours')],
			[gtLte('hours', 'minutes'), func('minutes')],
			[
				R.T,
				() => {
					if (value > 0) {
						const ret = Math.floor(value / timeDic['seconds'])
						arr.push(`${ret}${labels['seconds']}`)
					}
					return arr
				},
			],
		])(value)
	}

	return R.compose(R.join(' '), calc)(epoch)
}
