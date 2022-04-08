import moment from 'moment'

export const beforeDay = (days) => moment().startOf('day').subtract(days, 'day')
export const afterDay = (days) => moment().startOf('day').add(days, 'day')

export const bdFormat = (days) => beforeDay(days).format('YYYY-MM-DD')
export const adFormat = (days) => afterDay(days).format('YYYY-MM-DD')