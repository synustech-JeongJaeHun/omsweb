/* eslint-disable import/prefer-default-export */
import faker from 'faker'
import moment from 'moment'

export const genSimpleLineData = (beforeDay = 10, range = 5, num = 2) => {
  const genData = () =>
    [...Array(beforeDay + 1)].map((_, i) => {
      const timestamp = moment()
        .subtract(beforeDay - i, 'days')
        .valueOf()
      return [timestamp, faker.datatype.number(range)]
    })

  return [...Array(num)].map(genData)
}

export const genBasicBarData = (num = 50) =>
  [...Array(num)].map(() => [faker.name.findName(), faker.datatype.number(80)])
