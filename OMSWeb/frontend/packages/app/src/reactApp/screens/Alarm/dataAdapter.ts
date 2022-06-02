import * as R from 'ramda'
import { numberWithCommas, convertEpochToStr } from '@daimre/shared'

const convertTimeStr = (val) => {
  const dic = {
    '_': '일',
    h: '시간',
    m: '분',
    s: '초'
  }
  const arr = R.split(' ', val)

  return arr.reduce((acc, item) => {
    const num = Number(item.slice(0, 2))
    const char = item.slice(-1)

    if (num !== 0) {
      acc.push(`${num}${dic[char]}`)
    }

    return acc

  }, []).join(' ')
}

const stats = (data) => {
  const {
    total, time, avg
  } = data

  const totalconv = {
    variant: 'simple',
		data: {
			title: '총 알람',
			value: numberWithCommas(total),
			unit: '개',
		},
  }

  const convByDuration = {
    variant: 'detail',
		data: {
			title: '기간별 평균 발생',
			subLabel: '시간당',
			value: avg.ph,
			unit: '개',
			details: [
				{
					label: '연간',
					value: numberWithCommas(avg.yearly),
				},
				{
					label: '월별',
					value: numberWithCommas(avg.monthly),
				},
				{
					label: '주간',
					value: numberWithCommas(avg.weekly),
				},
				{
					label: '일별',
					value: numberWithCommas(avg.daily),
				},
			],
		},
  }

  const convTime = {
    variant: 'detail',
		data: {
			title: '발생시간',
			subLabel: '평균',
			value: convertEpochToStr(time.avg),
			unit: '',
			details: [
				{
					label: '최대',
					value: convertEpochToStr(time.max),
				},
				{
					label: '최소',
					value: convertEpochToStr(time.min),
				},
				{
					label: '편차',
					value: convertEpochToStr(time.devn),
				},
			],
		},
	}

  return [totalconv, convByDuration, convTime]

}

const charts = (data) => {
  const keys = R.keys(data)

  const convertA = (list) => {
    return list.map((item) => {
      const { label, count, avg } = item
      const temp = R.test(/-/g, label) ? label.slice(5): label
      return [temp, count, R.defaultTo(0)(avg)]
    })
  }
  const convertB = (list, section) => {
    return list.map((item) => {
      const { label, count, avg } = item
      return [label, count, R.defaultTo(0)(avg)]
    })
  }

  return keys.reduce((acc, item) => {
    const arr = data[item]
    if (item === 'duration') {
      acc[item] = convertA(arr)
    } else {
      acc[item] = convertB(arr, item)
    }

    return acc
  }, {})
}

export default { stats, charts }
