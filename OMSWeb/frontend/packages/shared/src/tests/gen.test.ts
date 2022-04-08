import getMultipleRect from '../gen/multipleRect'
import moment from 'moment'
import { getTimestampDuration } from '../dataviz/gen-data'

describe('데이타 생성', () => {
	// it('getMultipleRect 1개', () => {
	//   const rects = getMultipleRect(1)
	//   expect(rects).toEqual([
	//     {
	//       name: 'hello-0',
	//       status: 'normal',
	//     },
	//   ])
	// });
	it('getMultipleRect 100개', () => {
		const { length } = getMultipleRect(100)
		expect(length).toBe(100)
	})

	it('getTimestampDuration', () => {
		const to = moment().valueOf()
		const from = moment().subtract(1, 'days').valueOf()
		const data = getTimestampDuration(from, to, 100)
		expect(data.length).toBe(100)
	})
})
