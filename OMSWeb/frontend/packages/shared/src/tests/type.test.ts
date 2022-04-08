import { isType } from '../utils/common'

const arr = [1, 2, 3]
const obj = {}
const str = 'hello?'
const num = 124123
const strObj = new String('')
const nil = null
const und = undefined
const bool = false

describe('isType', () => {
  it('is array?', () => {
    const type = isType(arr)
    expect(type).toBe('array')
  });

  it('is object?', () => {
    const type = isType(obj)
    expect(type).toBe('object')
  });

  it('is string?', () => {
    const type = isType(str)
    expect(type).toBe('string')
  });

  it('is number?', () => {
    const type = isType(num)
    expect(type).toBe('number')
  });

  it('is string?', () => {
    const type = isType(strObj)
    expect(type).toBe('string')
  });

  it('is null?', () => {
    const type = isType(nil)
    expect(type).toBe('null')
  });

  it('is undefined?', () => {
    const type = isType(und)
    expect(type).toBe('undefined')
  });

  it('is boolean?', () => {
    const type = isType(bool)
    expect(type).toBe('boolean')
  });
  
});