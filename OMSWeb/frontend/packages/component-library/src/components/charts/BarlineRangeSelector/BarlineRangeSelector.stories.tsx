import * as React from 'react'
import BarlineRangeSelector from './index'
import { normaltrByVehicle as exData } from '../../../exData'

export default {
	title: '@daimre-ui/charts/BarlineRangeSelector',
	component: BarlineRangeSelector,
}

export const Basic = (args) => <BarlineRangeSelector {...args} />
Basic.args = {
	data: exData,
}
