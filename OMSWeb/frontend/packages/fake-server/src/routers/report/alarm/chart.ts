import * as R from 'ramda'
import {
	getDurationStr,
	getDurationLabel
} from '@daimre/shared'
import { format, getYear } from 'date-fns/fp'
import { dic, getSubsection } from '../shared'
import { query } from '../../../dbconnection'

const getName = (key) => {
	switch (key) {
		case 'source':
		case 'dest':
			return `
			(
				CASE
					WHEN SUBSTRING(${dic[key].name}, 1, 1) = 's'
					THEN (
						SELECT logical_id FROM stations WHERE id = CAST(substring(${dic[key].name}, 2) AS numeric)
					)
					WHEN SUBSTRING(${dic[key].name}, 1, 1) = 'b'
					THEN (
						SELECT logical_id FROM buffers WHERE id = CAST(substring(${dic[key].name}, 2) AS numeric)
					)
				END
			)
			`
		case 'vehicle':
			return `
			(
				SELECT logical_id
				FROM vehicles
				WHERE id = vehicle
			)
			`
		default:
			break;
	}
}


const subFilter = (key, value) => {
	switch (key) {
		case 'overview':
		case 'duration':
			return ''
		default:
			return value ? ` AND ${dic[key].name} = '${value}'`: ''
	}
}

const getFilter = ({ section, start, end }) => (key, value) => {
	switch (section) {
		case 'overview':
			return `
				time::DATE BETWEEN '${start}' AND '${end}'
			`
		case 'duration': {
			const [startStr, endStr] = R.split('_', value)
			return `
				time::DATE BETWEEN '${startStr}' AND '${endStr}'
			`
		}
		default:
			return `
				time::DATE BETWEEN '${start}' AND '${end}'
				${subFilter(key, value)}
			`
	}
}

const joinTable = `
	select
	va.id as alarm_id,
	oh.id as order_id,
	va.vehicle_id as vehicle,
	oh.location_pickup as source,
	oh.location_dropoff as dest,
	va.time,
	va.time_resolved,
	va.time_resolved - va.time as duration
	from
		vehicle_alarms va
		left join
			(
				select
				*
				from orders
			) as oh
		on oh.id = (
			select ord.id
			from orders as ord
			where
				va.vehicle_id = ord.vehicle_id and
				va.time between ord.time_created and greatest (
					time_assigned, time_vehicle_arrived,
					time_load_started, time_load_completed,
					time_unload_started, time_unload_completed,
					time_completed, time_aborted, time_failed
				)
			order by ord.id
			limit 1
		)
`

const avgEpochPerHour = `
COALESCE(
	TRUNC(
		(extract(epoch from avg(duration)) / 3600)::numeric, 2
	)::float,
	0
)
`

const makeDuration = ({ section, start, end }) =>  async (subsection, value) => {
	const filter = getFilter({ section, start, end})

	const getDurationByDay = (subsection, value, startStr, endStr) => {
		const queryStr = `
			SELECT
			TO_CHAR(days, 'YYYY-MM-DD') as label,
			(
				SELECT
				${avgEpochPerHour}
				FROM (${joinTable}) as temp
				WHERE
					time::DATE BETWEEN days AND days
					${subFilter(subsection, value)}
			) AS avg,
			(
				SELECT count(*)
				FROM (${joinTable}) as temp
				WHERE
					time::DATE BETWEEN days AND days
					${subFilter(subsection, value)}
			)::int
			FROM GENERATE_SERIES('${startStr}'::DATE, '${endStr}'::DATE, '1 days') days
		`
		return query(queryStr, '')
	}

	const getDurationByMonth = async (subsection, value) => {
		const durationList = getDurationStr(start, end)
		const queryStr = (arr) => {
			const { label, startStr, endStr } = getDurationLabel(arr)

			const sql = `
				select
				'${label}' as label,
				count(*)::int,
				${avgEpochPerHour} as avg,
				'${startStr}' as start_day,
				'${endStr}' as end_day
				from (${joinTable}) as temp
				where
					time::date between '${startStr}' and '${endStr}' and
					${filter(subsection, value)}
			`
			return sql
		}

		const queryPromiseList = durationList.map(async (startEnd) => {
			const ret = await query(queryStr(startEnd), '')
			return R.head(ret.rows)
		})

		return await Promise.all(queryPromiseList)
	}

	if (section === 'duration') {
		const [startStr, endStr] = R.split('_', value)
		const ret = await getDurationByDay(subsection, '', startStr, endStr)
		return ret.rows
	}

	return await getDurationByMonth(subsection, value)
}

const getOthers = async ({ section, start, end, selected_item }) => {
	const filter = getFilter({ section, start, end})
	const sectionList = getSubsection(section)

	const getQuery = (key, subsection = '', value = '') => {
		const queryStr = `
			select
			${getName(key)} as label,
			count(*)::int,
			${avgEpochPerHour} as avg
			from (${joinTable}) as temp
			where ${filter(subsection, value)} and ${dic[key]['name']} is not null
			group by ${dic[key]['name']}
		`
		return query(queryStr, '')
	}

	const queryPromiseList = sectionList.map(async (key) => {
		const ret = await getQuery(key, section, selected_item)
		return ret.rows
	})

	return await Promise.all(queryPromiseList)
}

const getAlarmChart = async ({ section, selected_item, start, end }) => {
	const getDuration = makeDuration({ section, start, end })
	const sectionList = getSubsection(section)

	const duration: any = await getDuration(section, selected_item)
	const others = await getOthers({ section, start, end, selected_item })

	return R.zipObj(
		['duration', ...sectionList],
		[duration, ...others]
	)
}

export default getAlarmChart
