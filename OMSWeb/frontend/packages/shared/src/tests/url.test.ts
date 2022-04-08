import { convertObjToQueryStr, convertQsToObj } from '../utils/url'

const obj = {
	a: 'hello',
	b: 'world',
	c: 'very',
	d: 'good',
}

const qsStr = '?a=hello&b=world'

describe('url test', () => {
	it('convertObjToQueryStr', () => {
		const list = convertObjToQueryStr(obj)
		expect(list).toBe('a=hello&b=world&c=very&d=good')
	})

	it('convertObjToQueryStr pick', () => {
		const list = convertObjToQueryStr(obj, ['a', 'b'])
		expect(list).toBe('a=hello&b=world')
	})

	// it('convertQsToObj', () => {
	//   const value = convertQsToObj(qsStr)
	//   expect(value).toEqual({ a: 'hello', b: 'world'})
	// });
})
