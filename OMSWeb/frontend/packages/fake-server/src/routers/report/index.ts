// @ts-ignore
import osu from 'node-os-utils'
import express from 'express'
import * as R from 'ramda'
const reportRouter = express.Router()
import { query } from '../../dbconnection'
import { getNormaltrChart, getNormaltrStat } from './normaltr'
import { getAbnormaltrChart, getAbnormaltrStat } from './abnormaltr'
import { getAlarmChart, getAlarmStat } from './alarm'

reportRouter.get('/report/labels', async (req, res) => {
	const ret = await query(
		`
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
	`,
		'',
	)

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
			case 'abnormaltr':
				return await getAbnormaltrStat()
			default:
				break
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
			case 'abnormaltr':
				return await getAbnormaltrChart(obj)
			case 'alarm':
				return await getAlarmChart(obj)
			default:
				return
		}
	}

	const data = await getData()

	res.json(data)
})

reportRouter.get('/report/trend', async (req, res) => {
	const { cpu, mem } = osu

	const delivery_time = await query(
		`
		select
		EXTRACT(EPOCH FROM avg(time_completed - time_created))::int as value,
		count(*)
		from orders
		where time_completed >= now() - interval '1 hours'
	`,
		'',
	)

	const wait_time = await query(
		`
		select
		EXTRACT(EPOCH FROM avg(time_load_completed  - time_created))::int as value,
		count(*)
		from orders
		where time_load_completed >= now() - interval '1 hours'
	`,
		'',
	)

	const transfer_time = await query(
		`
		select
		EXTRACT(EPOCH FROM avg(time_completed  - time_load_completed))::int as value,
		count(*)
		from orders
		where time_load_completed >= now() - interval '1 hours'
	`,
		'',
	)

	const assign_time = await query(
		`
		select
		EXTRACT(EPOCH FROM avg(time_assigned  - time_created))::int as value,
		count(*)
		from orders
		where time_assigned >= now() - interval '1 hours'
	`,
		'',
	)

	const number_of_order_request = await query(
		`
		select
		count(*) as value,
		count(*)
		from orders
		where time_created >= now() - interval '1 hours'
	`,
		'',
	)

	const vehicles = await query(
		`
		select
		(
			select count(*) from vehicles where mode = 'A'
		) as auto,
		(
			select count(*) from vehicles where mode = 'M' and (error_list = '') IS true
		) as manual,
		(
			select count(*) from vehicles where (error_list = '') IS false
		) as error,
		(
			select count(*) from vehicles where order_id is null
		) as idle
	`,
		'',
	)

	const loading_unloading = await query(
		`
    select
    (
      select count(*)
      from vehicles
      where cargo_state = 'U' or cargo_state = 'E'
    ) as unloading,
    (
      select count(*)
      from vehicles
      where cargo_state = 'L' or cargo_state = 'F'
    ) as loading
	`,
		'',
	)

	const range = await query(
		`
    select
    now() - interval '1 hours' as before_time,
    now() as current_time,
    count(*)
    from orders where time_modified >= now() - interval '1 hours'
  `,
		'',
	)

	const utilization = await query(
		`
    select
    TRUNC((EXTRACT(epoch FROM avg(time)) / 3600) * 100, 2)::float as value
    from (
      select
      CASE
         when time_created > now() - interval '1 hours' and max_field is null then now() - time_created
         when time_created <= now() - interval '1 hours' and max_field is null then interval '1 hours'
         when time_created <= now() - interval '1 hours' and max_field is not null and time_completed is null then interval '1 hours'
         when time_completed is not null then time_completed - (now() - interval '1 hours')
         ELSE interval '1 hours'
      end as time,
      id,
      time_created,
      max_field,
      time_completed
      from (
        select * from (
          select
          id,
          time_created,
          greatest (
            time_assigned, time_vehicle_arrived,
            time_load_started, time_load_completed,
            time_unload_started, time_unload_completed,
            time_completed
          ) as max_field,
          time_completed
          from orders
          where time_aborted is null and
          time_modified between now() - interval '1 hours' and now()
        ) temp
      ) temp
    ) temp
  `,
		'',
	)

	const cpuUsage = await cpu.usage()
	const cpuModel = await cpu.model()
	const memory = await mem.info()

	const obj = {
		vehicles,
		utilization,
		loading_unloading,
		range,
		delivery_time,
		wait_time,
		transfer_time,
		assign_time,
		number_of_order_request,
	}

	// const obj = {
	// 	utilization: 0,
	// 	order_change: 0,
	// }

	const ret = R.map(R.compose(R.map(Number), R.path(['rows', '0'])), obj)
	ret.cpu = {
		usage: cpuUsage,
		model: cpuModel,
	}
	ret.memory = {
		total: memory.totalMemMb,
		used: memory.usedMemMb,
		usedPercent: 100 - memory.freeMemPercentage,
	}

	res.json(ret)
})

reportRouter.get('/report/trend/utilization', async (req, res) => {
	const ret = await query(
		`
    select
    TRUNC((EXTRACT(epoch FROM avg(time)) / 3600) * 100, 2)::float as value
    from (
      select
      CASE
         when time_created > now() - interval '1 hours' and max_field is null then now() - time_created
         when time_created <= now() - interval '1 hours' and max_field is null then interval '1 hours'
         when time_created <= now() - interval '1 hours' and max_field is not null and time_completed is null then interval '1 hours'
         when time_completed is not null then time_completed - (now() - interval '1 hours')
         ELSE interval '1 hours'
      end as time,
      id,
      time_created,
      max_field,
      time_completed
      from (
        select * from (
          select
          id,
          time_created,
          greatest (
            time_assigned, time_vehicle_arrived,
            time_load_started, time_load_completed,
            time_unload_started, time_unload_completed,
            time_completed
          ) as max_field,
          time_completed
          from orders
          where time_aborted is null and
          time_modified between now() - interval '1 hours' and now()
        ) temp
      ) temp
    ) temp
  `,
		'',
	)

	const temp = R.compose(R.head, R.prop('rows'))(ret)

	res.json(temp)
})

reportRouter.get('/report/trend/delivery-time', async (req, res) => {
	const ret = await query(
		`
		select
		EXTRACT(EPOCH FROM avg(time_completed - time_created))::int as value,
		count(*)
		from orders
		where time_completed >= now() - interval '1 hours'
  `,
		'',
	)

	const temp = R.compose(R.head, R.prop('rows'))(ret)

	res.json(temp)
})

export default reportRouter
