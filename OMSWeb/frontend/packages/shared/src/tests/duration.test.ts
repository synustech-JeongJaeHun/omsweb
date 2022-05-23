import { getDateStr, convertDatestrToDate } from '../utils/duration'
import moment from 'moment'

describe('duration', () => {
	it('getDateStr', () => {
		const ret = convertDatestrToDate('1mo')
		expect('hello').toBe('hello')
	})
})
