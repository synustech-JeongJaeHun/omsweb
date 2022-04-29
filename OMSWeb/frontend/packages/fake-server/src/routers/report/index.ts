// @ts-ignore
import express from 'express'
import * as R from 'ramda'
const reportRouter = express.Router()
import { query } from '../../dbconnection'
import { getNormaltrChart, getNormaltrStat } from './normaltr'
import { getAlarmChart, getAlarmStat } from './alarm'


reportRouter.get('/report/labels', async (req, res) => {
	const ret = await query(`
		select *
		from (
			select
			concat('b', id) as id,
			logical_id as label
			from buffers
			union
			select
			concat('s', id) as id,
			logical_id as label
			from stations
			union
			select
			id::text as id,
			logical_id as label
			from vehicles
			order by id asc
		) as temp
		order by id
	`, '')

	res.json(ret.rows)
})

// 연간, 월별, 주별, 일별
// 올해 최초 / 올해 최근 / 몇일간
// 월 차이
// 주 차이
// 일 차이
reportRouter.post('/report/stats', async (req, res) => {
  const { variant } = req.body

	const getData = async () => {
		switch (variant) {
			case 'normaltr':
				return await getNormaltrStat()
			case 'alarm':
			return await getAlarmStat()
			default:
				break;
		}
	}

	const data = await getData()

	res.json(data)
})

// {
//   variant: 'normaltr', // normaltr, abnormaltr, alarm
//   section: 'overview', // overview, duration, vehicle, source, dest
//   selected_item: '', // duration일 경우 1월, 2월 | 나머지는 vehicle명, source명, dest명
//   start: '2022-03-15', // 시작일
//   end: '2022-03-16', // 종료일
// }
reportRouter.post('/report/charts', async (req, res) => {
  const { variant, section, selected_item, start, end } = req.body
	const obj = { section, selected_item, start, end }

	const getData = async () => {
		switch (variant) {
			case 'normaltr':
				return await getNormaltrChart(obj)
			case 'alarm':
				return await getAlarmChart(obj)
			default:
				return
		}
	}

	const data = await getData()

  res.json(data)
})

export default reportRouter
