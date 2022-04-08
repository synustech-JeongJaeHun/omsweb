import faker from 'faker'
import * as R from 'ramda'
import moment from 'moment'

type genBaselineType = (num?: number, range?: number) => number[][]
export const genBaseline: genBaselineType = (num = 30, range = 80) => {
  const mean = Math.floor(R.mean([1, num]))
  return [...Array(num)].map((_, i) => {
    const cnt = i + 1
    let timestamp
    if (cnt < mean) {
      timestamp = moment()
        .subtract(mean - cnt, 'days')
        .valueOf()
    } else if (cnt === mean) {
      timestamp = moment().valueOf()
    } else if (cnt > mean) {
      timestamp = moment()
        .add(cnt - mean, 'days')
        .valueOf()
    }

    return [timestamp, faker.datatype.number(range)]
  })
}

type getAreaChartDummyDataType = (
  num?: number,
  ranges?: number,
  gap?: number,
) => {
  point: number[][]
  workload: number[][]
  prediction: number[][]
  range: number[][]
}
const getAreaChartDummyData: getAreaChartDummyDataType = (
  num = 30,
  ranges = 100,
  gap = 80,
) => {
  const mean = Math.floor(R.mean([1, num]))

  const baseline = genBaseline(num, ranges)
  const range = baseline.map((item) => [
    item[0],
    item[1] - 60 - faker.datatype.number(gap),
    item[1] + 60 + faker.datatype.number(gap),
  ])

  let workload = baseline.slice(0, mean)
  workload = workload.map((arr, i) => [
    arr[0],
    arr[1] + faker.datatype.number(gap) * [-1, 1][faker.datatype.number(1)],
  ])
  const getPoint = () => {
    const idx = Math.floor(workload.length / 2)
    const datetime = workload[idx][0]
    const value = workload[idx][1]

    return [[datetime, value]]
  }
  const prediction = baseline
  const point = getPoint()

  return { point, workload, prediction, range }
}

export default getAreaChartDummyData
