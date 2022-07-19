export const tableConfig = {
	normaltr: {
		duration: {
			keys: ['duration', 'conveyance', 'avgConveyance'],
			header: [
				{
					caption: 'duration',
					dataField: 'duration',
				},
				{
					caption: 'TR count',
					dataField: 'conveyance',
					width: 80,
				},
				{
					caption: 'avg TR time(s)',
					dataField: 'avgConveyance',
					width: 115,
				},
			],
		},
		vehicle: {
			keys: ['name', 'conveyance', 'avgConveyance'],
			header: [
				{
					caption: 'vehicle name',
					dataField: 'name',
				},
				{
					caption: 'TR count',
					dataField: 'conveyance',
					width: 80,
				},
				{
					caption: 'avg TR time(s)',
					dataField: 'avgConveyance',
					width: 115,
				},
			],
		},
		source: {
			keys: ['name', 'conveyance', 'avgConveyance'],
			header: [
				{
					caption: 'source name',
					dataField: 'name',
				},
				{
					caption: 'TR count',
					dataField: 'conveyance',
					width: 80,
				},
				{
					caption: 'avg TR time(s)',
					dataField: 'avgConveyance',
					width: 115,
				},
			],
		},
		dest: {
			keys: ['name', 'conveyance', 'avgConveyance'],
			header: [
				{
					caption: 'dest name',
					dataField: 'name',
				},
				{
					caption: 'TR count',
					dataField: 'conveyance',
					width: 80,
				},
				{
					caption: 'avg TR time(s)',
					dataField: 'avgConveyance',
					width: 115,
				},
			],
		},
	},
	abnormaltr: {
		duration: {
			keys: ['duration', 'fa'],
			header: [
				{
					caption: 'duration',
					dataField: 'duration',
				},
				{
					caption: 'abnormal TR',
					dataField: 'fa',
				},
			],
		},
		vehicle: {
			keys: ['name', 'fa'],
			header: [
				{
					caption: 'vehicle name',
					dataField: 'name',
				},
				{
					caption: 'abnormal TR',
					dataField: 'fa',
				},
			],
		},
		source: {
			keys: ['name', 'fa'],
			header: [
				{
					caption: 'source name',
					dataField: 'name',
				},
				{
					caption: 'abnormal TR',
					dataField: 'fa',
				},
			],
		},
		dest: {
			keys: ['name', 'fa'],
			header: [
				{
					caption: 'dest name',
					dataField: 'name',
				},
				{
					caption: 'abnormal TR',
					dataField: 'fa',
				},
			],
		},
	},
	alarm: {
		duration: {
			keys: ['duration', 'alarmNum', 'avgHour'],
			header: [
				{
					caption: 'duration',
					dataField: 'duration',
				},
				{
					caption: 'alarm count',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: 'avg time under alarm(s)',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
		vehicle: {
			keys: ['name', 'alarmNum', 'avgHour'],
			header: [
				{
					caption: 'vehicle name',
					dataField: 'name',
				},
				{
					caption: 'alarm count',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: 'avg time under alarm(s)',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
		alarm: {
			keys: ['name', 'alarmNum', 'avgHour'],
			header: [
				{
					caption: 'alarm name',
					dataField: 'name',
				},
				{
					caption: 'alarm count',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: 'avg time under alarm(s)',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
		point: {
			keys: ['name', 'alarmNum', 'avgHour'],
			header: [
				{
					caption: 'segment name',
					dataField: 'name',
				},
				{
					caption: 'alarm count',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: 'avg time under alarm(s)',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
		source: {
			keys: ['name', 'alarmNum', 'avgHour'],
			header: [
				{
					caption: 'source name',
					dataField: 'name',
				},
				{
					caption: 'alarm count',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: 'avg time under alarm(s)',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
		dest: {
			keys: ['name', 'alarmNum', 'avgHour'],
			header: [
				{
					caption: 'dest name',
					dataField: 'name',
				},
				{
					caption: 'alarm count',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: 'avg time under alarm(s)',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
	},
}
