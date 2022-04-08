// @ts-nocheck
import * as R from 'ramda'
import moment from 'moment'

// m, h, d, mo, y,

export const getDateStr = (dateAbbr) => {
  switch (dateAbbr) {
    case 's':
      return 'seconds'
    case 'm':
      return 'minutes'
    case 'h':
      return 'hours'
    case 'd':
      return 'days'
    case 'w':
      return 'weeks'
    case 'mo':
      return 'months'
    case 'y':
      return 'years'
    default:
      break;
  }
}

export const parseDuration = (dur) => {
  let [_, num, dateAbbr] = dur.split(/(\d+)/)
  return {
    num: Number(num), 
    dateStr: getDateStr(dateAbbr)
  }
}

export const convertDatestrToDate = (str) => {
  const { num, dateStr } = parseDuration(str)
  return { 
    from: moment().subtract(num, dateStr).valueOf(), 
    to: moment().valueOf() 
  }
}

export const convertForecastTs = (str = '1w') => {
  const { num, dateStr } = parseDuration(str)

  return { 
    before: moment().subtract(num, dateStr).valueOf(), 
    current: moment().valueOf(),
    after: moment().add(num, dateStr).valueOf()
  }
}