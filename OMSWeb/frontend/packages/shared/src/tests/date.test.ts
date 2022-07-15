import {
	getDurationStr,
	getDurationLabel,
	convertDurationLabel,
	getEpoch,
	convertEpochToStr,
	getEnStrToStartEnd,
} from '../utils/date'

const obj = {
	ex1: ['2022-04-11', '2022-04-25'],
	ex2: ['2022-03-02', '2022-04-25'],
	ex3: ['2021-11-02', '2022-04-25'],
	ex4: ['2022-01-28', '2022-04-26'],
}

describe('date string and label', () => {
	it('ex1', () => {
		const ret = getDurationStr(obj.ex1[0], obj.ex1[1])
		expect(ret).toEqual([['2022-04-11', '2022-04-25']])
	})
	it('ex2', () => {
		const ret = getDurationStr(obj.ex2[0], obj.ex2[1])
		expect(ret).toEqual([
			['2022-03-02', '2022-03-31'],
			['2022-04-01', '2022-04-25'],
		])
	})
	it('ex3', () => {
		const ret = getDurationStr(obj.ex3[0], obj.ex3[1])
		expect(ret).toEqual([
			['2021-11-02', '2021-11-30'],
			['2021-12-01', '2021-12-31'],
			['2022-01-01', '2022-01-31'],
			['2022-02-01', '2022-02-28'],
			['2022-03-01', '2022-03-31'],
			['2022-04-01', '2022-04-25'],
		])
	})
	it('ex4', () => {
		const ret = getDurationStr(obj.ex4[0], obj.ex4[1])
		expect(ret).toEqual([
			['2022-01-28', '2022-01-31'],
			['2022-02-01', '2022-02-28'],
			['2022-03-01', '2022-03-31'],
			['2022-04-01', '2022-04-26'],
		])
	})

	it('duration label', () => {
		const ret = getDurationLabel(['2022-04-18', '2022-04-25'])
		expect(ret).toEqual({
			label: '4월(18~25)',
			startStr: '2022-04-18',
			endStr: '2022-04-25',
		})
	})

	it('getEnStrToStartEnd Apr(16~25)', () => {
		const ret = getEnStrToStartEnd('Apr(16~25)', '2022')
		expect(ret).toEqual(['2022-4-16', '2022-4-25'])
	})

	// it('convert duration label 4월(16~25)', () => {
	// 	const ret = convertDurationLabel('4월(16~25)', '2022')
	// 	expect(ret).toEqual('2022-4-16_2022-4-25')
	// })

	// it('convert duration label 4월', () => {
	// 	const ret = convertDurationLabel('4월', '2022')
	// 	expect(ret).toEqual('2022-4-01_2022-04-30')
	// })

	it('convert duration label Apr(16~25)', () => {
		const ret = convertDurationLabel('Apr(16~25)', '2022')
		expect(ret).toEqual('2022-4-16_2022-4-25')
	})

	it('convert duration label Apr', () => {
		const ret = convertDurationLabel('Apr', '2022')
		expect(ret).toEqual('2022-4-01_2022-04-30')
	})

	it('epoch -> interval string', () => {
		const ret = convertEpochToStr(220406400)
		expect(ret).toBe('7y 1M 1d')
	})

	it('epoch -> interval string - ex2', () => {
		const epoch = getEpoch('2022-04-15 07:15:45', '2022-04-25')
		const ret = convertEpochToStr(epoch)
		expect(ret).toBe('10d 1h 44m 15s')
	})

	it('epoch -> interval string - ex3', () => {
		const epoch = getEpoch('2022-04-15 07:15:45', '2022-04-25')
		const ret = convertEpochToStr(epoch, {
			days: 'd',
			hours: 'h',
			minutes: 'm',
			seconds: 's',
		})
		expect(ret).toBe('10d 1h 44m 15s')
	})
})
