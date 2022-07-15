import * as R from 'ramda'
import { getDurationStr, getDurationLabel } from '@daimre/shared'
import { format, getYear } from 'date-fns/fp'
import { dic, getSubsection, getName } from '../shared'
import { query } from '../../../dbconnection'
import { createOrderView } from '../shared'

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
				return `time_aborted::DATE BETWEEN '${start}' AND '${end}'`
			case 'duration': {
				const [startStr, endStr] = R.split('_', value)
				return `time_aborted::DATE BETWEEN '${startStr}' AND '${endStr}'`
			}
			default:
				return `time_aborted::DATE BETWEEN '${start}' AND '${end}'${subFilter(
					key,
					value,
				)}`
		}
	}

const makeDuration =
	({ section, start, end }) =>
	async (subsection, value) => {
		const getDurationByDay = (subsection, value, startStr, endStr) => {
			const queryStr = `
			SELECT
			TO_CHAR(days, 'YYYY-MM-DD') as label,
			(
				SELECT
        count(*)::int as failureAmount,
        0 as dest,
        0 as source,
        count(*)::int as abort,
        0 as cancel
				FROM total_orders oh
				WHERE
          time_aborted is not null and
					time_aborted::DATE BETWEEN days AND days
					${subFilter(subsection, value)}
			)
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
				count(*)::int as failureAmount,
        0 as dest,
        0 as source,
        count(*)::int as abort,
        0 as cancel
				from total_orders
				where time_aborted is not null and ${_filter(subsection, value)}
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
			count(*)::int as failureAmount,
      0 as dest,
      0 as source,
      count(*)::int as abort,
      0 as cancel
			FROM total_orders
			WHERE time_aborted is not null and ${filter(subsection, value)}
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

const getAbnormalTrData = async ({ section, selected_item, start, end }) => {
	const getDuration = makeDuration({ section, start, end })
	const sectionList = getSubsection(section)

	await createOrderView(start, end)
	const duration: any = await getDuration(section, selected_item)
	const others = await getOthers({ section, start, end, selected_item })

	return R.zipObj(['duration', ...sectionList], [duration, ...others])
}

export default getAbnormalTrData
