import aggr from '../utils/aggregator'

const arr = [1, 2, 3, 4, 5, 6, 7, 8]
const arr1 = [-100, 1, 2, 3, 4, 5, 6, 7, 10234]

describe('aggregator test', () => {
  it('avg', () => {
    const value = aggr.avg(arr)
    expect(value).toBe(4.5)
  });
    
  it('min', () => {
    const value = aggr.min(arr)
    expect(value).toBe(1)
  });

  it('max', () => {
    const value = aggr.max(arr)
    expect(value).toBe(8)
  });

  it('sum', () => {
    const value = aggr.sum(arr)
    expect(value).toBe(36)
  });
})
