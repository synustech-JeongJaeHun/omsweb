import * as React from 'react'
import BarlineRangeTable from './index'
import { normaltrByVehicle as exData } from '../../../exData'

export default {
  title: '@synusdev-ui/chart-set/BarlineRangeTable',
	component: BarlineRangeTable,
}

export const Basic = (args) => <BarlineRangeTable {...args} />
Basic.args = {
	data: exData,
}
