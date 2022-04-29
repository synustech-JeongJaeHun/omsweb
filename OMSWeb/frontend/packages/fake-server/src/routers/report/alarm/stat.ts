import { format, getYear } from 'date-fns/fp'
import { query } from '../../../dbconnection'
import * as R from 'ramda'

const getStat = async () => {

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
				time_resolved - time as calctime
			FROM vehicle_alarms
			WHERE time::DATE BETWEEN '${firstDay}' AND '${lastDay}'
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
					FROM vehicle_alarms va
					WHERE time::DATE BETWEEN '${firstDay}' AND '${lastDay}'
				) AS total
				FROM
				(
					SELECT
					(
						SELECT
						time
						FROM vehicle_alarms va
						WHERE time::DATE BETWEEN '${firstDay}' AND '${lastDay}'
						ORDER BY time ASC
						LIMIT 1
					) AS first,
					(
						SELECT
						time
						FROM vehicle_alarms va
						WHERE time::DATE BETWEEN '${firstDay}' AND '${lastDay}'
						ORDER BY time DESC
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

	return {
		total,
		time: {
			avg, min, max, devn,
		},
		avg: {
			ph, daily, weekly, monthly, yearly
		}
	}
}

export default getStat
