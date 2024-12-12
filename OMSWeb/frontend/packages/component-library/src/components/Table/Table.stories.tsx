import * as React from 'react'
import Table from './index'
import { normaltrByVehicle as exData } from '../../exData'
import { tableConfig } from '../../utils'

export default {
  title: '@synusdev-ui/Table',
	component: Table,
}

export const Basic = (args) => <Table {...args} />
Basic.args = {
	data: exData,
}

export const Empty = (args) => <Table {...args} />
Empty.args = {
	data: {
		header: tableConfig['normaltr']['duration']['header'],
		body: [],
	},
}
