import * as R from 'ramda'
import { calcColor5 } from './colorVariant'

export const MetricData = (metric) => (data) =>
  R.head(R.filter(R.propEq('type', metric), Array.isArray(data) ? data : []))


export const setMetricChart = (target) =>
  target
    ? [
        {
          name: target.type,
          data: target.data.map(([timestamp, value]) => [timestamp, value]),
        },
      ]
    : []

// default timeInterval : 1 hour unix stamp
export const setMetricBands = (target, timeInterval = 3600000) =>
  target
    ? target.data.map(([timestamp, score, score2]) => ({
        from: timestamp,
        to: timestamp + timeInterval,
        color: calcColor5(score2 || score),
      }))
    : []

export const makeChartData = (type, data) => ({
  series: R.pipe(MetricData(type), setMetricChart)(data),
  bands: R.pipe(MetricData(type), setMetricBands)(data),
})
