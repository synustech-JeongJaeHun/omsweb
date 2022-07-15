import { format, getYear } from 'date-fns/fp'
import { query } from '../../../dbconnection'
import * as R from 'ramda'
import { createOrderViewAll } from '../shared'

const getStat = async () => {
	const current = new Date()
	const currentYear = getYear(current)
	const firstDay = `${currentYear}-01-01`
	const lastDay = format('yyyy-MM-dd', current)

	const sql = `
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
			total::int as yearly,
      total::int
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
					FROM total_all_orders oh
					WHERE time_aborted IS NOT NULL
						AND time_modified::DATE BETWEEN '${firstDay}' AND '${lastDay}'
				) AS total
				FROM
				(
					SELECT
					(
						SELECT
						time_modified
						FROM total_all_orders
						WHERE time_modified::DATE BETWEEN '${firstDay}' AND '${lastDay}'
						ORDER BY time_modified ASC
						LIMIT 1
					) AS first,
					(
						SELECT
						time_modified
						FROM total_all_orders
						WHERE time_modified::DATE BETWEEN '${firstDay}' AND '${lastDay}'
						ORDER BY time_modified DESC
						LIMIT 1
					) AS last
				) AS temp
			) AS base
		`

	await createOrderViewAll()
	const ret = await query(sql, '')
	const { total, ph, daily, weekly, monthly, yearly } = R.head(ret.rows)

	return {
		total,
		avg: {
			ph,
			daily,
			weekly,
			monthly,
			yearly,
		},
	}
}

export default getStat
