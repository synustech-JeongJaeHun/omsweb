import * as R from 'ramda'
import {
	getDurationStr,
	getDurationLabel
} from '@daimre/shared'
import { format, getYear } from 'date-fns/fp'

export const dic = {
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
			break;
	}
}
