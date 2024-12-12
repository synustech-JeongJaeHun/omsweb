import { color as sharedColor } from '@synusdev/styles'
import { sortChartData } from '@synusdev/shared'
import { format } from 'date-fns/fp'

const dateForm = format('yyyy-MM-dd')
const dateForm1 = format('HH:mm:ss')

const getOptions = ({ name, data, width, converter }) => ({
	chart: {
		type: 'spline',
		backgroundColor: null,
		borderWidth: 0,
		// type: 'area',
		margin: [10, 0, 10, 0],
		height: 86,
		width,
		style: {
			overflow: 'visible',
		},
		skipClone: true,
		events: {
			load: function (event) {
				event.target.reflow()
			},
		},
		animation: false,
	},
	title: {
		text: null,
	},
	xAxis: {
		type: 'datetime',
		labels: {
			enabled: false,
		},
		title: {
			text: null,
		},
		startOnTick: false,
		endOnTick: false,
		tickPositions: [],
		lineColor: 'transparent',
	},
	yAxis: {
		endOnTick: false,
		startOnTick: false,
		labels: {
			enabled: false,
		},
		title: {
			text: null,
		},
		tickPositions: [0],
		gridLineColor: 'transparent',
		// plotLines: [
		//   {
		//     value: max,
		//     color: 'red',
		//     dashStyle: 'shortdash',
		//     width: 1,
		//   },
		// ],
	},
	tooltip: {
		hideDelay: 0,
		outside: true,
		shared: true,
		formatter: function () {
			return `
        <b>${dateForm1(this.x)}</b> ${dateForm(this.x)}<br />
        <b>${name}: ${converter !== null ? converter(this.y) : this.y}</b>
      `
		},
	},
	legend: {
		enabled: false,
	},

	plotOptions: {
		series: {
			lineWidth: 1,
			marker: {
				enabled: false,
			},
			animation: false,
		},
	},

	colors: ['#0072D3'],

	// Define the data points. All series have a dummy year
	// of 1970/71 in order to be compared on the same x axis. Note
	// that in JavaScript, months start at 0 for January, 1 for February etc.
	series: [
		{
			name,
			data: sortChartData(data),
		},
	],
})

export default getOptions
