import * as React from 'react'
import StackedBarTableV from './index'
import { abnormaltrByDuration as exData } from '../../../exData'

export default {
	title: '@daimre-ui/chart-set/StackedBarTableV',
	component: StackedBarTableV,
}

export const Basic = (args) => <StackedBarTableV {...args} />
Basic.args = {
	title: '기간별',
	data: exData,
}

export const Placeholder = (args) => <StackedBarTableV {...args} />
Placeholder.args = {
	title: '기간별',
	data: exData,
	isPlaceholder: true,
}


export const GetData = () => {
	const [isPlaceholder, updateState] = React.useState(true)
	const [ data, setData ] = React.useState(exData)

	React.useEffect(() => {
		setTimeout(() => {
			updateState(false)
			setData(exData)
		}, 6000)
	}, [])

	return <StackedBarTableV title='기간별' data={data} isPlaceholder={isPlaceholder} />
}
