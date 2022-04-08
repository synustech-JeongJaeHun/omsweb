import { numRound } from '../utils/number'

const _number = 12380913.18313123131
const _number1 = 1239132

const roundOff = numRound(1, true)
const round = numRound(1, false)

describe('number', () => {
  it('소수점 1자리에서 끊기', () => {
    const num = roundOff(_number)
    expect(num).toBe(12380913.1)
  });

  it('소수점 1자리에서 끊기', () => {
    const num = roundOff(_number1)
    expect(num).toBe(1239132)
  });

  it('소수점 1자리에서 반올림해서 끊기', () => {
    const num = round(_number)
    expect(num).toBe(12380913.2)
  });
})
