import { omitArray } from '../utils/array'

describe('omitArray', () => {
	it('wishkeys', () => {
		const wishKeys = ['duration', 'dest']
		const refKeys = ['duration', 'vehicle', 'source', 'dest']
		const arr = [
			{
				name: 'duration',
			},
			{
				name: 'vehicle',
			},
			{
				name: 'source',
			},
			{
				name: 'dest',
			},
		]

		const retArr = [
			{
				name: 'vehicle',
			},
			{
				name: 'source',
			},
		]

		const ret = omitArray(wishKeys, refKeys, arr)
		expect(ret).toEqual(retArr)
	})
})
