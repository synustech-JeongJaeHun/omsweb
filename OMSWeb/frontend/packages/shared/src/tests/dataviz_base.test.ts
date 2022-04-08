import { getMaxString } from '../dataviz/base'

describe('dataviz base test', () => {
  
  it('getMaxString', () => {
    const arr = ['hello', 'helloworld', 1293109830193]
    const ret = getMaxString(arr)
    expect(ret).toBe('1293109830193')
  });
  
});
