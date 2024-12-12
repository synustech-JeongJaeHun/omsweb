import * as React from 'react'
import BarlineTableV from './index'
import { normaltrByVehicle as exData } from '../../../exData'

export default {
  title: '@synusdev-ui/chart-set/BarlineTableV',
	component: BarlineTableV,
}

export const Basic = (args) => <BarlineTableV {...args} />
Basic.args = {
	data: exData,
}

export const Empty = (args) => <BarlineTableV {...args} />
Empty.args = {
	data: exData,
}

export const Placeholder = (args) => <BarlineTableV {...args} />
Placeholder.args = {
	data: exData,
	isPlaceholder: true
}
