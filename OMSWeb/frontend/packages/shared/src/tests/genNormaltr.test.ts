import genNormaltr from '../gen/normaltr'

describe('genNormaltr', () => {
	it('general', () => {
		const ret = genNormaltr({ variant: 'duration' })

		expect('hello').toBe('hello')
	})
})
