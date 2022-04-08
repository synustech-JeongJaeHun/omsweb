import * as React from 'react'
import TitleSet from './index'
import ContentPaneBody from '../../ContentPaneBody'
import { numberWithCommas } from '@daimre/shared'
import { exData, exEmptyData } from './exData'

export default {
	title: '@daimre-ui/comp-set/TitleSet',
	component: TitleSet,
}

export const Basic = (args) => {
	return (
		<ContentPaneBody>
			<TitleSet {...args} />
		</ContentPaneBody>
	)
}
Basic.args = {
	stats: exData,
	subtitle: '기간별 - 1월',
}

export const Empty = (args) => {
	return (
		<ContentPaneBody>
			<TitleSet {...args} />
		</ContentPaneBody>
	)
}
Empty.args = {
	stats: exEmptyData,
}

export const Placeholder = (args) => {
	return (
		<ContentPaneBody>
			<TitleSet {...args} />
		</ContentPaneBody>
	)
}
Placeholder.args = {
	stats: [{}, {}, {}],
	isPlaceholder: true
}

