import * as R from 'ramda'
import { shuffle } from '../utils/common'

const genStatus = (length) => {
  const percent = [0.02, 0.05]
  const statusList = ['danger', 'warning', 'normal']

  if (length === 1) {
    return ['normal']
  }
  const { list } = statusList.reduce((acc, status, i) => {
    const x = percent[i]
    let count
    if (statusList.length === i + 1) {
      count = acc.remainLength
    } else {
      count = Math.ceil(length * x)
      acc.remainLength = acc.remainLength - count
    }
    acc.list = R.concat(R.repeat(status, count), acc.list)
    return acc
  }, {
    remainLength: length,
    list: []
  })
  return shuffle<string>(list)
}

const makeData = (length) => {
  // const statusArr = genStatus(length)
  return [...Array(length)].map((_, i) => ({
    name: `hello-${i}`,
    value: Math.floor(Math.random() * 100),
    // status: statusArr[i]
  }))
}

export default makeData