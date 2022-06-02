import * as R from 'ramda'
import { getDurationStr, getDurationLabel } from '@daimre/shared'
import { format, getYear } from 'date-fns/fp'
import { dic, getSubsection, getName } from '../shared'
import { query } from '../../../dbconnection'

const subFilter = (key, value) => {
	switch (key) {
		case 'overview':
		case 'duration':
			return ''
		default:
			return value ? ` AND ${dic[key].column} = '${value}'` : ''
	}
}

const getFilter =
	({ section, start, end }) =>
	(key, value) => {
		switch (section) {
			case 'overview':
				return `time_completed::DATE BETWEEN '${start}' AND '${end}'`
			case 'duration': {
				const [startStr, endStr] = R.split('_', value)
				return `time_completed::DATE BETWEEN '${startStr}' AND '${endStr}'`
			}
			default:
				return `time_completed::DATE BETWEEN '${start}' AND '${end}'${subFilter(
					key,
					value,
				)}`
		}
	}

const avgEpochPerHour = `
COALESCE(
	TRUNC(
		(extract(epoch from avg(time_completed - time_created)) / 3600)::numeric, 2
	)::float,
	0
)
`

const makeDuration =
	({ section, start, end }) =>
	async (subsection, value) => {
		const getDurationByDay = (subsection, value, startStr, endStr) => {
			const queryStr = `
			SELECT
			TO_CHAR(days, 'YYYY-MM-DD') as label,
			(
				SELECT
				${avgEpochPerHour}
				FROM order_history oh
				WHERE
					time_completed is not null and
					time_completed::DATE BETWEEN days AND days
					${subFilter(subsection, value)}
			) AS avg,
			(
				SELECT count(*)
				FROM order_history oh
				WHERE
					time_completed is not null and
					time_completed::DATE BETWEEN days AND days
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
				const _filter = getFilter({ section, start: startStr, end: endStr })

				const sql = `
				select
				'${label}' as label,
				count(*)::int,
				${avgEpochPerHour} as avg,
				'${startStr}' as start_day,
				'${endStr}' as end_day
				from order_history
				where time_completed is not null and ${_filter(subsection, value)}
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
	const filter = getFilter({ section, start, end })
	const sectionList = getSubsection(section)

	const getQuery = (key, subsection = '', value = '') => {
		const queryStr = `
			SELECT
			${dic[key]['column']} AS id,
			${getName(key)} as label,
			COUNT(*)::int AS count,
			${avgEpochPerHour} as avg
			FROM order_history
			WHERE time_completed is not null and ${filter(subsection, value)}
			GROUP BY ${dic[key].column}
			ORDER BY label asc
		`
		return query(queryStr, '')
	}

	const queryPromiseList = sectionList.map(async (key) => {
		const ret = await getQuery(key, section, selected_item)
		return ret.rows
	})

	return await Promise.all(queryPromiseList)
}

const getNormalTrData = async ({ section, selected_item, start, end }) => {
	const getDuration = makeDuration({ section, start, end })
	const sectionList = getSubsection(section)

	const duration: any = await getDuration(section, selected_item)
	const others = await getOthers({ section, start, end, selected_item })

	return R.zipObj(['duration', ...sectionList], [duration, ...others])
}

export default getNormalTrData
