import * as React from 'react'
import Trend from './index'
import { exData, exEmptyData, exPlaceholderData } from './exData'

export default {
	title: '@daimre-ui/comp-set/Trend',
	component: Trend,
}


export const Basic = (args) => <Trend {...args} />
Basic.args = {
	data: exData
}

export const Empty = (args) => <Trend {...args} />
Empty.args = {
	data: exEmptyData
}

export const Placeholder = (args) => <Trend {...args} />
Placeholder.args = {
	data: exPlaceholderData,
	isPlaceholder: true
}

export const GetData = () => {
	const [isPlaceholder, updateState] = React.useState(true)
	const [ data, setData ] = React.useState(exPlaceholderData)

	React.useEffect(() => {
		const id = setTimeout(() => {
			updateState(false)
			setData(exData)
		}, 2000)

		return () => clearTimeout(id)
	}, [])

	return <Trend data={data} isPlaceholder={isPlaceholder} />
}
