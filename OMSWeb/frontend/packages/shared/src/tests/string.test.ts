import { getFixedDigitNumber } from '../utils/string'

describe('genNormaltr', () => {
	it('general', () => {
		const ret = getFixedDigitNumber(10)
		expect(ret).toEqual([
			'001',
			'002',
			'003',
			'004',
			'005',
			'006',
			'007',
			'008',
			'009',
			'010',
		])
	})
})
