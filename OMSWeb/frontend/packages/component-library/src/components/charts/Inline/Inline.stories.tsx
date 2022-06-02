import * as React from 'react'
import * as R from 'ramda'
import { genBaseline, useInterval, useSelfUpdatedData } from '@daimre/shared'
import Inline from './index'

export default {
	title: '@daimre-ui/charts/Inline',
	component: Inline,
}

export const Basic = (args) => <Inline {...args} />
Basic.args = {
	data: genBaseline(),
}

export const UpdatedChart = () => {
	const range = 60 * 10 * 1000
	const interval = 1000 * 3
	const [data, updateData] = useSelfUpdatedData(range, interval)

	useInterval(() => {
		updateData(Math.random() * 100)
	}, interval)

	return <Inline data={data} />
}
