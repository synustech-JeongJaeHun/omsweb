import * as React from 'react'
import OverviewAbnormal from './index'
import { exEmptyData, exData } from './exData'

export default {
	title: '@daimre-ui/comp-set/OverviewAbnormal',
	component: OverviewAbnormal,
}

export const Basic = (args) => <OverviewAbnormal {...args} />
Basic.args = {}

export const Empty = (args) => <OverviewAbnormal {...args} />
Empty.args = {
	...exEmptyData
}

export const Placeholder = (args) => <OverviewAbnormal {...args} />
Placeholder.args = {
	...exEmptyData,
	isPlaceholder: true
}

export const GetData = () => {
	const [isPlaceholder, updateState] = React.useState(true)
	const [ data, setData ] = React.useState(exEmptyData)

	React.useEffect(() => {
		const id = setTimeout(() => {
			updateState(false)
			setData(exData)
		}, 5000)

		return () => clearTimeout(id)
	}, [])


	return <OverviewAbnormal {...data} isPlaceholder={isPlaceholder}/>
}
