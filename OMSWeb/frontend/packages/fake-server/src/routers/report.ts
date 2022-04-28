// @ts-ignore
import express from 'express'
import * as R from 'ramda'
import {
	getDurationStr,
	getDurationLabel
} from '@daimre/shared'
const reportRouter = express.Router()
import { query } from '../dbconnection'
import sql from 'sql-template-strings'
import { format, getYear } from 'date-fns/fp'

// reportRouter.get('/dashboard/lists', (req, res) => {
//   res.json(typeList)
// })

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
	const current = new Date()
	const currentYear = getYear(current)
	const firstDay = `${currentYear}-01-01`
	const lastDay = format('yyyy-MM-dd', current)

	const sql1 = `
		SELECT
			EXTRACT(EPOCH FROM min(calctime))::int as min,
			EXTRACT(EPOCH FROM max(calctime))::int as max,
			EXTRACT(EPOCH FROM (max(calctime) - min(calctime)))::int as devn,
			EXTRACT(EPOCH FROM avg(calctime))::int as avg,
			count(*)::int as total
		FROM (
			SELECT
				time_completed - time_created as calctime
			FROM orders
			WHERE time_completed IS NOT NULL
				AND time_completed::DATE BETWEEN '${firstDay}' AND '${lastDay}'
		) AS a
	`

	const sql2 =`
		SELECT
			days,
			weeks,
			months,
			hours,
			CASE
				WHEN days = 0 THEN total
				ELSE total / days
			END::int AS daily,
			CASE
				WHEN weeks = 0 THEN total
				ELSE total / weeks
			END::int AS weekly,
			CASE
				WHEN months = 0 THEN total
				ELSE total / months
			END::int AS monthly,
			CASE
				WHEN hours = 0 THEN total
				ELSE total / hours
			END::int AS ph,
			total::int as yearly
			FROM
			(
				SELECT
				(EXTRACT(days FROM last - first))::int AS days,
				(Ceil(EXTRACT(days FROM last - first) / 7))::int AS weeks,
				DATE_PART('month', AGE(last, first)) AS months,
				(EXTRACT(EPOCH FROM last - first)/3600)::int AS hours,
				(
					SELECT
						count(*)
					FROM orders oh
					WHERE time_completed IS NOT NULL
						AND time_completed::DATE BETWEEN '${firstDay}' AND '${lastDay}'
				) AS total
				FROM
				(
					SELECT
					(
						SELECT
						time_completed
						FROM orders
						WHERE time_completed IS NOT NULL
						AND time_completed::DATE BETWEEN '${firstDay}' AND '${lastDay}'
						ORDER BY time_completed ASC
						LIMIT 1
					) AS first,
					(
						SELECT
						time_completed
						FROM orders
						WHERE time_completed IS NOT NULL
						AND time_completed::DATE BETWEEN '${firstDay}' AND '${lastDay}'
						ORDER BY time_completed DESC
						LIMIT 1
					) AS last
				) AS temp
			) AS base
	`

	const pList = [sql1, sql2].map(async (q) => {
		const temp = await query(q, '')
		return R.head(temp.rows)
	})
	const ret = await Promise.all(pList)
	const {
		total,
		avg, min, max, devn,
		ph, daily, weekly, monthly, yearly
	} = R.mergeAll(ret)

	res.json({
		total,
		time: {
			avg, min, max, devn,
		},
		avg: {
			ph, daily, weekly, monthly, yearly
		}
	})

	// const temp = {
	// 	total: ret.total,
	// 	time: {

	// 	},
	// 	avg: {

	// 	}
	// }


	// switch (variant) {
	// 	case 'normaltr':
	// 		list = {
	// 			total: 63000,
	// 			time: {
	// 				avg: '9m 30s',
	// 				max: '16m 49s',
	// 				min: '3m 10s',
	// 				devn: '5m 15s'
	// 			},
	// 			avg: {
	// 				ph: 21.61,
	// 				yearly: 63300,
	// 				monthly: 15825,
	// 				weekly: 3516,
	// 				daily: 518,
	// 			}
	// 		 }
	// 		break;
	// 	case 'abnormaltr':
	// 		list = {
	// 			total: 63,
	// 			avg: {
	// 				ph: 0.04,
	// 				yearly: 63,
	// 				monthly: 16,
	// 				weekly: 4,
	// 				daily: 1,
	// 			}
	// 		}
	// 		break;
	// 	case 'alarm':
	// 		list = {
	// 			total: 100,
	// 			time: {
	// 				avg: '9m 30s',
	// 				max: '16m 49s',
	// 				min: '3m 10s',
	// 				devn: '5m 15s'
	// 			},
	// 			avg: {
	// 				ph: 0.03,
	// 				yearly: 100,
	// 				monthly: 25,
	// 				weekly: 6,
	// 				daily: 1,
	// 			}
	// 		}
	// 		break;
	// 	default:
	// 		break;
	// }
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

	const dic = {
		vehicle: {
			column: 'vehicle_id',
			name: 'vehicle'
		},
		source: {
			column: 'location_pickup',
			name: 'source'
		},
		dest: {
			column: 'location_dropoff',
			name: 'dest'
		},
	}

	const getSubsection = (section) => {
		switch (section) {
			case 'vehicle':
			case 'source':
			case 'dest':
				return ['vehicle', 'source', 'dest']
			default:
				return ['vehicle', 'source', 'dest']
		}
	}


	const getName = (key) => {
		switch (key) {
			case 'source':
			case 'dest':
				return `
					CASE
						WHEN SUBSTRING(${dic[key].column}, 1, 1) = 's'
						THEN (
							SELECT logical_id FROM stations WHERE id = CAST(substring(${dic[key].column}, 2) AS numeric)
						)
						WHEN SUBSTRING(${dic[key].column}, 1, 1) = 'b'
						THEN (
							SELECT logical_id FROM buffers WHERE id = CAST(substring(${dic[key].column}, 2) AS numeric)
						)
					END AS label
				`
			case 'vehicle':
				return `
				(
					SELECT logical_id
					FROM vehicles
					WHERE id = vehicle_id
				) as label
				`
			default:
				break;
		}
	}

	const subFilter = (key, value) => {
		if (section === 'overview' || section === 'duration') {
			return ''
		}
		return value ? ` AND ${dic[key].column} = '${value}'`: ''
	}

	const filter = (key, value) => {
		if (section === 'overview') {
			return ` AND time_completed BETWEEN '${start}' AND '${end}'`
		} else if (section === 'duration') {
			const [startStr, endStr] = R.split('_', value)
			return ` AND time_completed::DATE BETWEEN '${startStr}' AND '${endStr}'`
		}
		return ` AND time_completed::DATE BETWEEN '${start}' AND '${end}'${subFilter(key, value)}`
	}

	const getQuery = (key, subsection = '', value = '') => {
		const queryStr = `
			SELECT
			${dic[key]['column']} AS id,
			${getName(key)},
			COUNT(*)::int AS count,
			TRUNC((date_part('epoch', SUM(time_completed - time_created) / COUNT(*)) / 3600)::numeric, 2)::float AS avg
			FROM orders
			WHERE
				time_completed IS NOT NULL
				${filter(subsection, value)}
			GROUP BY ${dic[key].column}
			ORDER BY label asc
		`
		// console.log('queryStr', queryStr)

		return query(queryStr, '')
	}

	const getDurationByDay = (subsection, value, startStr, endStr) => {
		const queryStr = `
			SELECT
			TO_CHAR(days, 'YYYY-MM-DD') as label,
			(
				SELECT
					TRUNC((date_part('epoch', SUM(time_completed - time_created) / COUNT(*)) / 3600)::numeric, 2)::float
				FROM orders oh
				WHERE
					time_completed::DATE BETWEEN days AND days
					${subFilter(subsection, value)}
			) AS avg,
			(
				SELECT count(*)
				FROM orders oh
				WHERE
					time_completed::DATE BETWEEN days AND days
					${subFilter(subsection, value)}
			)::int
			FROM GENERATE_SERIES('${startStr}'::DATE, '${endStr}'::DATE, '1 days') days
		`
		return query(queryStr, '')
	}

	const getDurationByMonth = async (subsection, value) => {
		const dList = getDurationStr(start, end)

		const queryStr = (arr) => {
			const { label, startStr, endStr } = getDurationLabel(arr)

			return `
				select
				'${label}' as label,
				count(*)::int,
				TRUNC((date_part('epoch', SUM(time_completed - time_created) / COUNT(*)) / 3600)::numeric, 2)::float as avg,
				'${startStr}' as start_day,
				'${endStr}' as end_day
				from orders
				where time_completed::date between '${startStr}' and '${endStr}'
				${filter(subsection, value)}
			`
		}

		const pList = dList.map(async (startEnd) => {
			const ret = await query(queryStr(startEnd), '')
			return R.head(ret.rows)
		})

		const rList = await Promise.all(pList)
		return rList
	}

	const getDuration = async (subsection, value) => {
		if (section === 'duration') {
			const [startStr, endStr] = R.split('_', value)
			const ret = await getDurationByDay(subsection, '', startStr, endStr)
			return ret.rows
		}

		return await getDurationByMonth(subsection, value)
	}

	// const data = await getQuery('dest')
	const list = getSubsection(section)
	const pList = list.map(async (key) => {
		const ret = await getQuery(key, section, selected_item)
		return ret.rows
	})
	const duration: any = await getDuration(section, selected_item)
	const rList = await Promise.all(pList)

	const data = R.zipObj(
		['duration', ...list],
		[duration, ...rList]
	)


  res.json(data)
})

export default reportRouter
