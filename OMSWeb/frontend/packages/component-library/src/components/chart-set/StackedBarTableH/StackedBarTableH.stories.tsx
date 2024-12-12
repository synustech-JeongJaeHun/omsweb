import * as React from 'react'
import StackedBarTableH from './index'
import { abnormaltrByVehicle as exData } from '../../../exData'

export default {
  title: '@synusdev-ui/chart-set/StackedBarTableH',
	component: StackedBarTableH,
}

export const Basic = (args) => <StackedBarTableH {...args} />
Basic.args = {
	data: exData,
	limit: 6,
}

export const Placeholder = (args) => <StackedBarTableH {...args} />
Placeholder.args = {
	data: exData,
	isPlaceholder: true,
	limit: 6,
}

export const GetData = () => {
	const [isPlaceholder, updateState] = React.useState(true)
	const [ data, setData ] = React.useState(exData)

	React.useEffect(() => {
		setTimeout(() => {
			updateState(false)
			setData(exData)
		}, 4000)
	}, [])

	return <StackedBarTableH data={data} isPlaceholder={isPlaceholder} limit={6} />
}
