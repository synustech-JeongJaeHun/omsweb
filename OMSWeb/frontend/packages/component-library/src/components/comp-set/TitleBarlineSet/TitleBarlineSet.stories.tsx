import * as React from 'react'
import TitleBarlineSet from './index'
import { exStatData, exEmptyData } from './exData'
import { genNormaltr } from '@daimre/shared'
const { normaltr: nStat, alarm: aStat } = exStatData
const { normaltr: nEmpty, alarm: aEmpty } = exEmptyData

export default {
	title: '@daimre-ui/comp-set/TitleBarlineSet',
	component: TitleBarlineSet,
}

export const Basic = (args) => <TitleBarlineSet {...args} />
Basic.args = {}

export const Normaltr = (args) => <TitleBarlineSet {...args} />
Normaltr.args = {
	pageVariant: 'normaltr',
	stats: nStat,
	data: genNormaltr({ variant: 'overview' }),
}

export const Alarm = (args) => <TitleBarlineSet {...args} />
Alarm.args = {
	pageVariant: 'alarm',
	stats: aStat,
}

export const Empty = (args) => <TitleBarlineSet {...args} />
Empty.args = {
	...nEmpty,
}

export const Placeholder = (args) => <TitleBarlineSet {...args} />
Placeholder.args = {
	...nEmpty,
	isPlaceholder: true,
}

export const GetData = () => {
	const [isPlaceholder, updateState] = React.useState(true)
	const [data, setData] = React.useState(nEmpty)

	React.useEffect(() => {
		const id = setTimeout(() => {
			updateState(false)
			setData({
				pageVariant: 'alarm',
				stats: aStat,
				data: genNormaltr({ variant: 'duration', pageType: 'alarm' }),
			})
		}, 5000)

		return () => clearTimeout(id)
	}, [])

	return (
		<TitleBarlineSet
			pageVariant="alarm"
			{...data}
			isPlaceholder={isPlaceholder}
		/>
	)
}
