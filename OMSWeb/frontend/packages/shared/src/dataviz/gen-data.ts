// @ts-nocheck
import faker from 'faker'
import * as R from 'ramda'
import moment from 'moment'
import 'moment/locale/ko'
import {
  convertDatestrToDate,
  convertForecastTs,
  parseDuration
} from '../utils/duration'

const asc = (a, b) => a - b
const desc = (a, b) => b - a

export const getTimestampDuration = (from: number, to: number, totalLength: number) => {
  const diff = to - from
  const space = Math.floor(diff / totalLength)
  return [...Array(totalLength)].map((_, i) => from + (i * space))
}


const getTsBefore = (from, to, num, dateStr) => {
  let isLt = true
  let i = 0
  const arr = []
  while (isLt) {
    const prev = moment(to).subtract(num * i, dateStr).valueOf()
    if (prev >= from) {
      i = i + 1
      arr.push(prev)
    } else {
      isLt = false
    }
  }

  return R.sort(asc, arr)
}

const getTsAfter = (from, to, num, dateStr) => {
  let isGt = true
  let i = 0
  const arr = []
  while (isGt) {
    const next = moment(from).add(num * i, dateStr).valueOf()
    if (next <= to) {
      i = i + 1
      arr.push(next)
    } else {
      isGt = false
    }
  }

  return R.sort(asc, arr)
}

export const getTsArr = (duration: string, interval: string) => {
  const { from, to } = convertDatestrToDate(duration)
  const { num, dateStr } = parseDuration(interval)
  return getTsBefore(from, to, num, dateStr)
}

export const getForecastTsArr = (duration: string, interval: string) => {
  const { before, current, after } = convertForecastTs(duration)
  const { num, dateStr } = parseDuration(interval)
  const beforeList = getTsBefore(before, current, num, dateStr)
  const afterList = getTsAfter(current, after, num, dateStr)

  return {
    beforeList,
    afterList,
    mergedList: R.concat(beforeList, R.tail(afterList)),
    current
  }

}

const genRandMP = (randNum) => {
  const randMP = () => {
    const arr = [-1, 1]
    const rand = R.compose<number>(Math.round, Math.random)(arr)
    return [-1, 1][rand]
  }

  return randMP() * faker.datatype.number(randNum)
}

const genRangeItem = (baseGap, gap) => (item) => [
  item[0],
  item[1] - baseGap - faker.datatype.number(gap),
  item[1] + baseGap + faker.datatype.number(gap),
]

const genWorkloadItem = (gap) => item => [
  item[0],
  item[1] + faker.datatype.number(gap) * [-1, 1][faker.datatype.number(1)],
]

const gentleRandom = (totalLength, ranges, randNum) => {
  const baseValue = Math.floor(ranges / 2)

  const initialValue = {
    before: baseValue, data: []
  }

  const { data } = [...Array(totalLength)].reduce((acc, i) => {
    const value = acc.before + genRandMP(randNum)
    acc.before = value
    acc.data.push(value)
    return acc
  }, initialValue)

  return data
}

type genBaselineType = (props) => number[][]
export const genBaseline: genBaselineType = (props) => {
  const defaultOpt = {
    totalLength: 30, ranges: 80, unit: 'seconds', uunit: 1
  }

  const { totalLength, ranges, unit, uunit, forecast, randNum } = { ...defaultOpt, ...props }
  const midpoint = totalLength - forecast
  const gentleRandomArr = gentleRandom(totalLength, ranges, randNum)

  return [...Array(totalLength)].map((_, i) => {
    const cnt = i + 1
    let timestamp
    if (cnt < midpoint) {
      timestamp = moment()
        .subtract(uunit * (midpoint - cnt), unit)
        .valueOf()
    } else if (cnt === midpoint) {
      timestamp = moment().valueOf()
    } else if (cnt > midpoint) {
      timestamp = moment()
        .add(uunit * (cnt - midpoint), unit)
        .valueOf()
    }

    return [timestamp, gentleRandomArr[i]]
  })

}

type genDataType = (props: any) => {
  workload: number[][]
  forecast: number[][]
  anomaly: number[][]
}
export const genAreaLineData: genDataType = (props) => {
  const defaultOpt = {
    totalLength: 30, ranges: 200, gap: 40, baseGap: 10,
    unit: 'days', forecast: 15, randNum: 200, uunit: 1
  }
  const {
    totalLength, ranges, gap, baseGap,
    unit, uunit, forecast, randNum
  } = { ...defaultOpt, ...props }
  const midpoint = totalLength - forecast

  const baseline = genBaseline({ totalLength, ranges, unit, forecast, randNum, uunit })
  const range = baseline.map(genRangeItem(baseGap, gap))

  return {
    workload: R.compose(
      R.map(genWorkloadItem(gap)),
      R.slice(0, midpoint)
    )(baseline),
    forecast: baseline.slice(midpoint),
    anomaly: range.slice(0, midpoint),
    baseline
  }
}

export const genTimeseries = (props = {}) => {
  const defaultProps = {
    timespan: '1h', // 1h, 2h, 4h, 1d
    interval: '20s', // 20s, 40s, 1m, 5m, 20m
    range: [0, 100],
  }

  const {
    timespan,
    interval,
    range
  } = {...defaultProps, ...props}

  const { beforeList: tsArr } = getForecastTsArr(timespan, interval)

  const totalLength = tsArr.length
  const ranges = range[1] - range[0]
  const randNum = 200
  const baseGap = 100
  const gap = 200

  const values = gentleRandom(totalLength, ranges, randNum)
  const baseline = R.zip(tsArr, values)
  const rangeArr = baseline.map(genRangeItem(baseGap, gap))

  return {
    workload: R.map(genWorkloadItem(gap), baseline),
    anomaly: rangeArr,
    baseline
  }
}

export const genForecastTimeseries = (props = {}) => {
  const defaultProps = {
    timespan: '1w', // 1h, 2h, 4h, 1d
    interval: '40m', // 20s, 40s, 1m, 5m, 20m
    range: [0, 100],
  }

  const {
    timespan,
    interval,
    range
  } = {...defaultProps, ...props}

  const {
    mergedList: tsArr,
    current
  } = getForecastTsArr(timespan, interval)

  const totalLength = tsArr.length
  const ranges = range[1] - range[0]
  const randNum = 200
  const baseGap = 10
  const gap = 40

  const values = gentleRandom(totalLength, ranges, randNum)
  const baseline = R.zip(tsArr, values)
  const currentIdx = R.indexOf(current, tsArr)

  return {
    workload: R.compose(
      R.map(genWorkloadItem(gap)),
      R.slice(0, currentIdx)
    )(baseline),
    forecast: baseline.slice(currentIdx),
    baseline
  }
}



export const updateRangeWorkload = ({
  data,
  randNum,
  baseGap,
  gap,
}) => {
  const isTimeSnap = true
  let workload = data.workload
  let anomaly = data.anomaly
  let lastBaselineValue = R.compose(R.last, R.last)(data.baseline)
  const getTimeSnap = arr => isTimeSnap ? R.tail(arr) : arr

  return () => {
    const currTimestamp = moment().valueOf()
    const baseValue = lastBaselineValue + genRandMP(randNum)
    lastBaselineValue = baseValue
    const baseItem = [currTimestamp, baseValue]
    const workloadItem = genWorkloadItem(gap)(baseItem)
    const rangeItem = genRangeItem(baseGap, gap)(baseItem)
    workload = [...getTimeSnap(workload), workloadItem]
    anomaly = [...getTimeSnap(anomaly), rangeItem]

    return { workload, anomaly }
  }
}

export const genUpdatableAreaLineData = (props) => {
  const randNum = 200
  const baseGap = 10
  const gap = 40
  const arrSize = 400
  const isTimeSnap = false

  let { workload, anomaly, baseline } = genAreaLineData({
    totalLength: arrSize, ranges: 200,
    unit: 'minutes', forecast: 0,
    randNum, gap, baseGap,
  })

  let lastBaselineValue = R.compose(R.last, R.last)(baseline)
  const getTimeSnap = arr => isTimeSnap ? R.tail(arr) : arr

  setInterval(() => {
    const currTimestamp = moment().valueOf()
    const baseValue = lastBaselineValue + genRandMP(randNum)
    lastBaselineValue = baseValue
    const baseItem = [currTimestamp, baseValue]
    const workloadItem = genWorkloadItem(gap)(baseItem)
    const rangeItem = genRangeItem(baseGap, gap)(baseItem)
    workload = [...getTimeSnap(workload), workloadItem]
    anomaly = [...getTimeSnap(anomaly), rangeItem]


  }, 5000)

}
