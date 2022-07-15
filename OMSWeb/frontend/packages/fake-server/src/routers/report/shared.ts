import * as R from 'ramda'
import { getDurationStr, getDurationLabel } from '@daimre/shared'
import { format, getYear } from 'date-fns/fp'
import { query } from './../../dbconnection'

export const dic = {
	vehicle: {
		column: 'vehicle_id',
		name: 'vehicle',
	},
	source: {
		column: 'location_pickup',
		name: 'source',
	},
	dest: {
		column: 'location_dropoff',
		name: 'dest',
	},
}

export const getSubsection = (section) => {
	switch (section) {
		case 'vehicle':
		case 'source':
		case 'dest':
			return ['vehicle', 'source', 'dest']
		default:
			return ['vehicle', 'source', 'dest']
	}
}

export const getName = (key) => {
	switch (key) {
		case 'source':
		case 'dest':
			return `
			(
				CASE
					WHEN SUBSTRING(${dic[key].column}, 1, 1) = 's'
					THEN (
						SELECT logical_id FROM stations WHERE id = CAST(substring(${dic[key].column}, 2) AS numeric)
					)
					WHEN SUBSTRING(${dic[key].column}, 1, 1) = 'b'
					THEN (
						SELECT logical_id FROM buffers WHERE id = CAST(substring(${dic[key].column}, 2) AS numeric)
					)
				END
			)
			`
		case 'vehicle':
			return `
			(
				SELECT logical_id
				FROM vehicles
				WHERE id = vehicle_id
			)
			`
		default:
			break
	}
}

export const createOrderView = (start, end) => {
	const queryStr = `
	CREATE or REPLACE VIEW total_orders as (
		select *
		from (
			select
				history_source_id as order_id,
				max(id) as history_id
			from order_history
			where time_modified::date between '${start}' and '${end}'
			group by history_source_id
		) temp
		join order_history oh
		on oh.id = temp.history_id
	)
	`
	return query(queryStr, '')
}

export const createOrderViewAll = () => {
	const queryStr = `
	CREATE or REPLACE VIEW total_all_orders as (
		select *
		from (
			select
				history_source_id as order_id,
				max(id) as history_id
			from order_history
			group by history_source_id
		) temp
		join order_history oh
		on oh.id = temp.history_id
	)
	`
	return query(queryStr, '')
}
