import { convertR, convertLabelsToOptions } from '../report'
import exLabels from '../report/filter/exLabels'
import exOptions from '../report/filter/exOptions'
import exSubfilter from '../report/filter/exSubfilter'
import exSelection from '../report/filter/exSelection'
import exEmpty from '../report/filter/exEmpty'

describe('report convertR - common', () => {
	it('convertLabelsToOptions', () => {
		const ret = convertLabelsToOptions(exLabels)
		expect(ret).toEqual(exOptions)
	})
})

describe('report convertR empty- normaltr / abnormaltr', () => {
	const { subfilterToSelection, selectionToSubfilter, subfilterToSubquery } =
		convertR('normaltr', [])

	it('convertLabelsToOptions', () => {
		const ret = convertLabelsToOptions([])
		expect(ret).toEqual(exEmpty.options)
	})

	it('subfilterToSelection', () => {
		const ret = subfilterToSelection(exSubfilter.normaltr)
		expect(ret).toEqual(exEmpty.selection)
	})
	it('selectionToSubfilter', () => {
		const ret = selectionToSubfilter(exSubfilter.normaltr)
		expect(ret).toEqual(exEmpty.subfilterTr)
	})
	it('subfilterToSubquery', () => {
		const ret = subfilterToSubquery(exSubfilter.normaltr)
		expect(ret).toEqual(exEmpty.subfilterTr)
	})
})

describe('report convertR empty- alarm', () => {
	const { subfilterToSelection, selectionToSubfilter, subfilterToSubquery } =
		convertR('alarm', [])

	it('convertLabelsToOptions', () => {
		const ret = convertLabelsToOptions([])
		expect(ret).toEqual(exEmpty.options)
	})

	it('subfilterToSelection', () => {
		const ret = subfilterToSelection(exSubfilter.alarm)
		expect(ret).toEqual(exEmpty.selection)
	})
	it('selectionToSubfilter', () => {
		const ret = selectionToSubfilter(exSubfilter.alarm)
		expect(ret).toEqual(exEmpty.subfilterAlarm)
	})
	it('subfilterToSubquery', () => {
		const ret = subfilterToSubquery(exSubfilter.alarm)
		expect(ret).toEqual(exEmpty.subfilterAlarm)
	})
})

describe('report convertR - normaltr / abnormaltr', () => {
	const { subfilterToSelection, selectionToSubfilter, subfilterToSubquery } =
		convertR('normaltr', exLabels)

	it('subfilterToSelection', () => {
		const ret = subfilterToSelection(exSubfilter.normaltr)

		expect(ret).toEqual({
			vehicle: [
				{ label: 'VC101', value: '1' },
				{ label: 'VC102', value: '2' },
				{ label: 'VC103', value: '3' },
			],
			sourceB: [],
			sourceS: [
				{ label: 'W8STK101A_OUT07', value: 's1' },
				{ label: 'W8STK106A_IN03', value: 's10' },
				{ label: 'W8STK106A_OUT07', value: 's11' },
				{ label: 'W8STK107A_IN03', value: 's12' },
				{ label: 'W8STK107A_OUT07', value: 's13' },
				{ label: 'W8STK108A_OUT07', value: 's14' },
			],
			destB: [],
			destS: [
				{ label: 'W8STK101A_OUT07', value: 's1' },
				{ label: 'W8STK106A_IN03', value: 's10' },
				{ label: 'W8STK106A_OUT07', value: 's11' },
			],
		})
	})

	it('selectionToSubfilter', () => {
		const ret = selectionToSubfilter(exSelection)
		expect(ret).toEqual({
			vehicle: ['1', '2', '3'],
			source: ['s1', 's10', 's11'],
			dest: ['s1', 's10', 's11'],
		})
	})

	it('subfilterToSubquery', () => {
		const ret = subfilterToSubquery(exSubfilter.normaltr)
		expect(ret).toEqual({
			vehicle: [1, 2, 3],
			source: ['s1', 's10', 's11', 's12', 's13', 's14'],
			dest: ['s1', 's10', 's11'],
		})
	})
})

describe('report convertR - alarm', () => {
	const { subfilterToSelection, selectionToSubfilter, subfilterToSubquery } =
		convertR('alarm', exLabels)

	it('subfilterToSelection', () => {
		const ret = subfilterToSelection(exSubfilter.alarm)

		expect(ret).toEqual({
			vehicle: [
				{ label: 'VC101', value: '1' },
				{ label: 'VC102', value: '2' },
				{ label: 'VC103', value: '3' },
			],
			point: [
				{ label: '1', value: '1' },
				{ label: '12', value: '12' },
				{ label: '15', value: '15' },
			],
			alarm: [
				{ label: 'ERR_USER', value: '10000' },
				{ label: 'ERR_NOT_INITIAL', value: '10101' },
				{ label: 'ERR_NOT_SET_PIO_HOIST', value: '10105' },
			],
		})
	})

	it('selectionToSubfilter', () => {
		const ret = selectionToSubfilter(exSelection)
		expect(ret).toEqual({
			vehicle: ['1', '2', '3'],
			point: ['1', '12', '15'],
			alarm: ['10000', '10101', '10105'],
		})
	})

	it('subfilterToSubquery', () => {
		const ret = subfilterToSubquery(exSubfilter.alarm)
		expect(ret).toEqual({
			vehicle: [1, 2, 3],
			point: ['1', '12', '15'],
			alarm: [10000, 10101, 10105],
		})
	})
})
