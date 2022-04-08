import * as React from 'react'
import Barline from './index'
import { normaltrByVehicle as exData } from '../../../exData'

export default {
	title: '@daimre-ui/charts/Barline',
	component: Barline,
}

export const Basic = (args) => <Barline {...args} />
Basic.args = {
	data: exData,
}

export const Empty = (args) => <Barline {...args} />
Empty.args = {
	data: {
		header: [
			{
				caption: 'Vehicle명',
				dataField: 'vehicleName',
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
		body: []
	},
}

export const Placeholder = (args) => <Barline {...args} />
Placeholder.args = {
	data: {
		header: [
			{
				caption: 'Vehicle명',
				dataField: 'vehicleName',
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
		body: []
	},
	isPlaceholder: true
}
