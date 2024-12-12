import * as React from 'react'
import BarlineTableH from './index'
import { normaltrByVehicle as exData } from '../../../exData'

export default {
  title: '@synusdev-ui/chart-set/BarlineTableH',
	component: BarlineTableH,
}

export const Basic = (args) => <BarlineTableH {...args} />
Basic.args = {
	data: exData,
	limit: 6,
}

export const Empty = (args) => <BarlineTableH {...args} />
Empty.args = {
	data: {
		header: [],
		body: []
	},
	limit: 6,
}


export const Placeholder = (args) => <BarlineTableH {...args} />
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
	isPlaceholder: true,
	limit: 6,
}

