export const tableConfig = {
	normaltr: {
		duration: {
			keys: ['duration', 'conveyance', 'avgConveyance'],
			header: [
				{
					caption: '기간',
					dataField: 'duration',
				},
				{
					caption: '반송량',
					dataField: 'conveyance',
					width: 80,
				},
				{
					caption: '평균반송시간',
					dataField: 'avgConveyance',
					width: 115,
				},
			],
		},
		vehicle: {
			keys: ['name', 'conveyance', 'avgConveyance'],
			header: [
				{
					caption: 'vehicle명',
					dataField: 'name',
				},
				{
					caption: '반송량',
					dataField: 'conveyance',
					width: 80,
				},
				{
					caption: '평균반송시간',
					dataField: 'avgConveyance',
					width: 115,
				},
			],
		},
		source: {
			keys: ['name', 'conveyance', 'avgConveyance'],
			header: [
				{
					caption: 'source명',
					dataField: 'name',
				},
				{
					caption: '반송량',
					dataField: 'conveyance',
					width: 80,
				},
				{
					caption: '평균반송시간',
					dataField: 'avgConveyance',
					width: 115,
				},
			],
		},
		dest: {
			keys: ['name', 'conveyance', 'avgConveyance'],
			header: [
				{
					caption: 'dest명',
					dataField: 'name',
				},
				{
					caption: '반송량',
					dataField: 'conveyance',
					width: 80,
				},
				{
					caption: '평균반송시간',
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
					caption: '기간',
					dataField: 'duration',
				},
				{
					caption: '실패량',
					dataField: 'fa',
				},
			],
		},
		vehicle: {
			keys: ['name', 'fa'],
			header: [
				{
					caption: 'vehicle명',
					dataField: 'name',
				},
				{
					caption: '실패량',
					dataField: 'fa',
				},
			],
		},
		source: {
			keys: ['name', 'fa'],
			header: [
				{
					caption: 'source명',
					dataField: 'name',
				},
				{
					caption: '실패량',
					dataField: 'fa',
				},
			],
		},
		dest: {
			keys: ['name', 'fa'],
			header: [
				{
					caption: 'dest명',
					dataField: 'name',
				},
				{
					caption: '실패량',
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
					caption: '기간',
					dataField: 'duration',
				},
				{
					caption: '알람수',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: '평균시간',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
		vehicle: {
			keys: ['name', 'alarmNum', 'avgHour'],
			header: [
				{
					caption: 'vehicle명',
					dataField: 'name',
				},
				{
					caption: '알람수',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: '평균시간',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
		alarm: {
			keys: ['name', 'alarmNum', 'avgHour'],
			header: [
				{
					caption: 'alarm명',
					dataField: 'name',
				},
				{
					caption: '발생량',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: '평균시간',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
		segment: {
			keys: ['name', 'alarmNum', 'avgHour'],
			header: [
				{
					caption: 'segment명',
					dataField: 'name',
				},
				{
					caption: '발생량',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: '평균시간',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
		source: {
			keys: ['name', 'alarmNum', 'avgHour'],
			header: [
				{
					caption: 'source명',
					dataField: 'name',
				},
				{
					caption: '알람수',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: '평균시간',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
		dest: {
			keys: ['name', 'alarmNum', 'avgHour'],
			header: [
				{
					caption: 'dest명',
					dataField: 'name',
				},
				{
					caption: '알람수',
					dataField: 'alarmNum',
					width: 80,
				},
				{
					caption: '평균시간',
					dataField: 'avgHour',
					width: 115,
				},
			],
		},
	},
}
