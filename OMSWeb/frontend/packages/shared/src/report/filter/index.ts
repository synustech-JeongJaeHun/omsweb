import * as R from 'ramda'
import { isFullEmpty } from '../../utils/common'
import exEmpty from './exEmpty'

const getOpt = (options) => (value) => R.find(R.propEq('value', value), options)
const getB = R.filter((value) => R.test(/^b/, value))
const getS = R.filter((value) => R.test(/^s/, value))

export const convertLabelsToOptions = (labels) => {
	// label -> options
	if (isFullEmpty(labels)) {
		return exEmpty.options
	}

	const ret = R.compose(
		R.map(
			R.map((item) => {
				const { label, id } = R.omit(['section'], item)
				return {
					label: R.defaultTo(id)(label),
					value: id,
				}
			}),
		),
		R.groupBy(R.prop('section')),
	)(labels)

	return { ...exEmpty.options, ...ret }
}

export const convertR = (variant, label) => {
	const options = convertLabelsToOptions(label)
	const optDic = R.map((arr) => {
		return arr.reduce((acc, item) => {
			const { label, value } = item
			acc[value] = label
			return acc
		}, {})
	}, options)
	const convertStrArrToNumber = (props = [], objArr) => {
		const keys = R.keys(objArr)
		return keys.reduce((acc, key) => {
			const values = objArr[key]
			acc[key] = R.includes(key, props) ? R.map(Number, values) : values
			return acc
		}, {})
	}

	const genEmptySubfilter = () => {
		if (variant === 'normaltr' || variant === 'abnormaltr') {
			return exEmpty.subfilterTr
		} else if (variant === 'alarm') {
			return exEmpty.subfilterAlarm
		} else {
			return exEmpty.subfilterAll
		}
	}

	const convertOptionsToSubfilter = () => {
		const { vehicle, buffer, station, point, alarm } = R.map(
			R.pluck('value'),
			options,
		)
		if (variant === 'normaltr' || variant === 'abnormaltr') {
			return {
				vehicle,
				source: [...buffer, ...station],
				dest: [...buffer, ...station],
			}
		} else if (variant === 'alarm') {
			return {
				vehicle,
				point,
				alarm,
			}
		} else {
			return {
				vehicle,
				source: [...buffer, ...station],
				dest: [...buffer, ...station],
				point,
				alarm,
			}
		}
	}

	return {
		options,
		subfilterToSelection(subfilter) {
			// subfilter -> selection
			if (isFullEmpty(label)) {
				return exEmpty.selection
			}

			if (subfilter === null) {
				subfilter = convertOptionsToSubfilter()
			}

			const keys = R.keys(subfilter)
			const ret = keys.reduce((acc, key) => {
				const values = subfilter[key]
				if (key === 'source' || key === 'dest') {
					const [vBuffer, vStation, oBuffer, oStation] = [
						getB(values),
						getS(values),
						options['buffer'],
						options['station'],
					]
					acc[`${key}B`] =
						oBuffer !== undefined ? R.map(getOpt(oBuffer), vBuffer) : []
					acc[`${key}S`] =
						oStation !== undefined ? R.map(getOpt(oStation), vStation) : []
				} else {
					acc[key] = R.map(getOpt(options[key]), values)
				}
				return acc
			}, {})

			return R.map(
				R.filter((item) => item !== undefined),
				ret,
			)
		},
		selectionToSubfilter(selection) {
			// selection -> subfilter

			if (isFullEmpty(label)) {
				return genEmptySubfilter()
			}

			const getLabelValue = () => {
				if (variant === 'normaltr' || variant === 'abnormaltr') {
					return {
						vehicle: selection['vehicle'],
						source: [...selection['sourceB'], ...selection['sourceS']],
						dest: [...selection['destB'], ...selection['destS']],
					}
				} else if (variant === 'alarm') {
					return {
						vehicle: selection['vehicle'],
						point: selection['point'],
						alarm: selection['alarm'],
					}
				} else {
					return selection
				}
			}
			const labelValues = getLabelValue()
			return R.map(R.pluck('value'), labelValues)
		},
		subfilterToSubquery(subfilter) {
			if (isFullEmpty(label)) {
				return genEmptySubfilter()
			}

			// subfilter -> subquery
			if (variant === 'normaltr' || variant === 'abnormaltr') {
				return convertStrArrToNumber(['vehicle'], subfilter)
			} else {
				return convertStrArrToNumber(['vehicle', 'alarm'], subfilter)
			}
		},
	}
}
