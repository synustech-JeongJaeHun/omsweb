import { getDateStr, convertDatestrToDate } from '../utils/duration'
import moment from 'moment'

describe('duration', () => {
  it('getDateStr', () => {
    const ret = convertDatestrToDate('1mo')
    console.log('ret', ret)
    console.log('from', moment(ret.from).format('YYYY-MM-DD HH:mm:ss'))
    console.log('to', moment(ret.to).format('YYYY-MM-DD HH:mm:ss'))
    expect('hello').toBe('hello')
  });
  
})
