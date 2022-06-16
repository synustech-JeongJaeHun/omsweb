const dic = {
	duration: {
		title: '기간별',
		exportFilename: 'abnormaltr_기간별',
	},
	vehicle: {
		title: 'Vehicle별',
		subText: '(TOP 6)',
		exportFilename: 'abnormaltr_vehicle별',
		limit: 6,
	},
	source: {
		title: 'Source별',
		subText: '(TOP 6)',
		exportFilename: 'abnormaltr_source별',
		limit: 6,
	},
	dest: {
		title: 'Dest별',
		subText: '(TOP 6)',
		exportFilename: 'abnormaltr_dest별',
		limit: 6,
	},
}

const dic2 = {
	duration: {
		header: [
			{
				caption: '기간',
				dataField: 'label',
			},
			{
				caption: '실패량',
				dataField: 'failureamount',
				width: 80,
			},
		],
		body: [],
	},
	vehicle: {
		header: [
			{
				caption: 'Vehicle명',
				dataField: 'label',
			},
			{
				caption: '실패량',
				dataField: 'failureamount',
				width: 80,
			},
		],
		body: [],
	},
	source: {
		header: [
			{
				caption: 'Source명',
				dataField: 'label',
			},
			{
				caption: '실패량',
				dataField: 'failureamount',
				width: 80,
			},
		],
		body: [],
	},
	dest: {
		header: [
			{
				caption: 'Dest명',
				dataField: 'label',
			},
			{
				caption: '실패량',
				dataField: 'failureamount',
				width: 80,
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
