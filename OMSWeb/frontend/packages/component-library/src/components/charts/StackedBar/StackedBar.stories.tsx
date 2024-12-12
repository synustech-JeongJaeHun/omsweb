import * as React from 'react'
import StackedBar from './index'
import { abnormaltrByVehicle as exData } from '../../../exData'

export default {
  title: '@synusdev-ui/charts/StackedBar',
	component: StackedBar,
}

export const Basic = (args) => <StackedBar {...args} />
Basic.args = {
	data: exData,
}

export const Empty = (args) => <StackedBar {...args} />
Empty.args = {
	data: {
		header: [
			{
				caption: 'Vehicle명',
				dataField: 'vehicleName',
			},
			{
				caption: '실패량',
				dataField: 'avgConveyance',
				width: 115,
			},
		],
		body: []
	},
}

export const Placeholder = (args) => <StackedBar {...args} />
Placeholder.args = {
	data: {
		header: [
			{
				caption: 'Vehicle명',
				dataField: 'vehicleName',
			},
			{
				caption: '실패량',
				dataField: 'avgConveyance',
				width: 115,
			},
		],
		body: []
	},
	isPlaceholder: true
}

