export default {
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
	body: [
		{
			label: '1월',
			failureamount: 21,
			dest: 2,
			source: 3,
			abort: 3,
			cancel: 3,
		},
		{
			label: '2월',
			failureamount: 23,
			dest: 2,
			source: 4,
			abort: 4,
			cancel: 4,
		},
		{
			label: '3월',
			failureamount: 26,
			dest: 3,
			source: 4,
			abort: 4,
			cancel: 4,
		},
		{
			label: '4월',
			failureamount: 19,
			dest: 2,
			source: 2,
			abort: 2,
			cancel: 2,
		},
	],
}
