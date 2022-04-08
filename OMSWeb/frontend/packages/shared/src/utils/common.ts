// @ts-nocheck
import * as R from 'ramda'

const mapIndexed = R.addIndex(R.map)

export function isFullEmpty(value) {
	return R.or(R.isEmpty(value), R.isNil(value))
}

export function isNotFullEmpty(value) {
	return R.and(!R.isNil(value), !R.isEmpty(value))
}

export function defaultTo(alt, value) {
	value = isFullEmpty(value) ? null : value
	return R.defaultTo(alt)(value)
}

export function defaultToS(value, alterValue) {
	if (typeof value === 'string') {
		return alterValue
	}

	return value
}

export const defaultToC = R.curryN(2, defaultTo)

export const anyEmpty = R.compose(R.any(isFullEmpty), R.values)

export function getDividedArray(data, groupNum) {
	const { length } = data
	const unitPerGroup = Math.ceil(length / groupNum)

	return [...Array(groupNum)].map((_, i) => {
		const arr = data.slice(unitPerGroup * i, unitPerGroup * (i + 1))
		return arr
	})
}

export const getLastLvLength = (list) => {
	const group: any = R.compose((obj) => {
		const keys = R.keys(obj)
		return keys.reduce((acc, key) => {
			const item = obj[key]
			acc[key] = item.length
			return acc
		}, {})
	}, R.groupBy(R.prop('lv')))(list)

	const last = R.compose(
		R.last,
		R.sort((a: number, b: number) => a - b),
		R.keys,
	)(group)
	return group[last]
}

export const sortChartData = (arr) => {
	if (!Array.isArray(arr)) {
		return []
	}

	return arr.sort((a, b) => a[0] - b[0])
}

export const serial = {
	encode: (obj) => {
		const keys = R.keys(obj)
		return keys.reduce((acc, key, i) => {
			const { length } = keys
			const isLast = length === i + 1
			acc += `${key}=${obj[key]}${isLast ? '' : '&'}`
			return acc
		}, '')
	},
	decode: R.compose(R.fromPairs, R.map(R.split('=')), R.split('&')),
}

export const anyTrueEquals = (oldList, newList) =>
	R.compose(
		R.includes(true),
		mapIndexed((obj, i) => !R.equals(obj, newList[i])),
	)(oldList)

export function shuffle<T>(array: T[]): T[] {
	let currentIndex = array.length,
		temporaryValue,
		randomIndex

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1

		temporaryValue = array[currentIndex]
		array[currentIndex] = array[randomIndex]
		array[randomIndex] = temporaryValue
	}

	return array
}

export const noop = () => {}

export const isType = (value) => {
	let kind = typeof value

	if (kind === 'object') {
		if (Array.isArray(value)) {
			kind = 'array'
		}
		if (R.is(String, value)) {
			kind = 'string'
		}
		if (value === null) {
			kind = 'null'
		}
	}

	return kind
}

export const numberWithCommas = (x) => {
	return Number(x)
		.toFixed(0)
		.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
