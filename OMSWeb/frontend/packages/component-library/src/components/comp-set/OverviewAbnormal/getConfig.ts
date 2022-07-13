const dic = {
	duration: {
		title: 'By Duration',
		exportFilename: 'abnormaltr_by_duration',
	},
	vehicle: {
		title: 'By Vehicle',
		subText: '(TOP 6)',
		exportFilename: 'abnormaltr_by_vehicle',
		limit: 6,
	},
	source: {
		title: 'By Source',
		subText: '(TOP 6)',
		exportFilename: 'abnormaltr_by_source',
		limit: 6,
	},
	dest: {
		title: 'By Dest',
		subText: '(TOP 6)',
		exportFilename: 'abnormaltr_by_dest',
		limit: 6,
	},
}

const dic2 = {
	duration: {
		header: [
			{
				caption: 'duration',
				dataField: 'label',
			},
			{
				caption: 'abnormal TR count',
				dataField: 'failureamount',
				width: 120,
			},
		],
		body: [],
	},
	vehicle: {
		header: [
			{
				caption: 'vehicle name',
				dataField: 'label',
			},
			{
				caption: 'abnormal TR count',
				dataField: 'failureamount',
				width: 120,
			},
		],
		body: [],
	},
	source: {
		header: [
			{
				caption: 'source name',
				dataField: 'label',
			},
			{
				caption: 'abnormal TR count',
				dataField: 'failureamount',
				width: 120,
			},
		],
		body: [],
	},
	dest: {
		header: [
			{
				caption: 'dest name',
				dataField: 'label',
			},
			{
				caption: 'abnormal TR count',
				dataField: 'failureamount',
				width: 120,
			},
		],
		body: [],
	},
}

const getConfig = (variant, data) => {
	return {
		...dic[variant],
		data: {
			...dic2[variant],
			body: data,
		},
	}
}

export default getConfig
