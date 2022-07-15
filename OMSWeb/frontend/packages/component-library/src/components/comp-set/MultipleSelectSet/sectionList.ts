const sectionList = {
	normaltr: {
		showColorPicker: false,
		selectList: [
			{
				label: 'vehicle',
				altLabel: '',
				section: 'vehicle',
				option: 'vehicle',
				column: 'col-1-5',
			},
			{
				label: 'source',
				altLabel: '',
				section: 'sourceB',
				option: 'buffer',
				column: 'col-1-5',
			},
			{
				label: '',
				altLabel: 'source',
				section: 'sourceS',
				option: 'station',
				column: 'col-1-5',
				altColumn: 'col-2-5',
				ref: 'sourceB',
			},
			{
				label: 'dest',
				altLabel: '',
				section: 'destB',
				option: 'buffer',
				column: 'col-1-5',
			},
			{
				label: '',
				altLabel: 'dest',
				section: 'destS',
				option: 'station',
				column: 'col-1-5',
				altColumn: 'col-2-5',
				ref: 'destB',
			},
		],
	},
	abnormaltr: {
		showColorPicker: true,
		selectList: [
			{
				label: 'vehicle',
				section: 'vehicle',
				option: 'vehicle',
				column: 'col-1-5',
			},
			{
				label: 'source',
				altLabel: '',
				section: 'sourceB',
				option: 'buffer',
				column: 'col-1-5',
			},
			{
				label: '',
				altLabel: 'source',
				section: 'sourceS',
				option: 'station',
				column: 'col-1-5',
				altColumn: 'col-2-5',
				ref: 'sourceB',
			},
			{
				label: 'dest',
				section: 'destB',
				option: 'buffer',
				column: 'col-1-5',
			},
			{
				label: '',
				altLabel: 'dest',
				section: 'destS',
				option: 'station',
				column: 'col-1-5',
				altColumn: 'col-2-5',
				ref: 'destB',
			},
		],
	},
	alarm: {
		showColorPicker: false,
		selectList: [
			{
				label: 'vehicle',
				section: 'vehicle',
				option: 'vehicle',
				column: 'col-1-5',
			},
			{
				label: 'point',
				section: 'point',
				option: 'point',
				column: 'col-1-5',
			},
			{
				label: 'alarm',
				section: 'alarm',
				option: 'alarm',
				column: 'col-3-5',
			},
		],
	},
}

export default sectionList
