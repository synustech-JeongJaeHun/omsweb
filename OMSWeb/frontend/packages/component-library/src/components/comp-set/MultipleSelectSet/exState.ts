import { getFixedDigitNumber } from '@daimre/shared'

const genOptions = (prefix, length) => {
	const arr = getFixedDigitNumber(length)
	return arr.map((item) => ({
		label: `${prefix}_${item}`,
		value: `${prefix}_${item}`,
	}))
}

export const colorArr = [
	{
		id: 'id_mismatch',
		label: 'ID Mismatch',
		color: '#ea5545',
		isChecked: true,
	},
	{
		id: 'id_read_fail',
		label: 'ID Read Fail',
		color: '#f46a9b',
		isChecked: true,
	},
	{
		id: 'id_duplicate',
		label: 'ID Duplicate',
		color: '#ef9b20',
		isChecked: true,
	},
	{
		id: 'source_pio_timeout',
		label: 'Source PIO Timeout',
		color: '#edbf33',
		isChecked: true,
	},
	{
		id: 'dest_pio_timeout',
		label: 'Dest PIO Timeout',
		color: '#ede15b',
		isChecked: true,
	},
	{
		id: 'source_empty',
		label: 'Source Empty',
		color: '#bdcf32',
		isChecked: true,
	},
	{
		id: 'double_storage',
		label: 'Double Storage',
		color: '#87bc45',
		isChecked: true,
	},
	{
		id: 'abort',
		label: 'Abort',
		color: '#27aeef',
		isChecked: true,
	},
	{
		id: 'cancel',
		label: 'Cancel',
		color: '#b33dc6',
		isChecked: true,
	},
	{
		id: 'vehicle_error',
		label: 'Vehicle Error',
		color: '#9b19f5',
		isChecked: true,
	},
]

export const options = {
	vehicle: genOptions('veh', 30),
	buffer: [],
	// buffer: genOptions('b', 100),
	station: genOptions('s', 300),
	point: genOptions('point', 200),
	alarm: genOptions('alarm', 100),
}
