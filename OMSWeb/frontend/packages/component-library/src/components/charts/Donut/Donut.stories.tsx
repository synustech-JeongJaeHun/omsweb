import * as React from 'react'
import Styled from '@emotion/styled'
import { color } from '@synusdev/styles'

import Donut from './index'

export default {
  title: '@synusdev-ui/charts/Donut',
	component: Donut,
}

const exData1 = [
	['error', 30],
	['idle', 20],
	['manual', 50],
	['auto', 200],
]

const exData2 = [
	['unloading', 80],
	['loading', 120],
]

const Wrapper = Styled.div`
  display: flex;
  width: 680px;
  background-color: ${color.bg};
  justify-content: space-between;
  overflow: hidden;
`

export const Basic = (args) => <Donut {...args} />
Basic.args = {
	data: exData1,
}

export const Other = (args) => <Donut {...args} />
Other.args = {
	data: exData2,
}
export const Empty = (args) => <Donut {...args} />
Empty.args = {
	data: [],
}

export const Placeholder = (args) => <Donut {...args} />
Placeholder.args = {
	data: exData1,
	isPlaceholder: true
}

