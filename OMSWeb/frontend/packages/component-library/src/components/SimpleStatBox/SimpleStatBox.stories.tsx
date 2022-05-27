import * as React from 'react'
import SimpleStatBox from './index'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { genBaseline, useInterval, useSelfUpdatedData } from '@daimre/shared'

export default {
	title: '@daimre-ui/SimpleStatBox',
	component: SimpleStatBox,
}

const Wrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin-bottom: -5px;
	margin-right: -5px;

	${({ boxType }) =>
		boxType === 'alarm' &&
		css`
			margin-bottom: -1px;
			margin-right: -1px;
		`}
`

export const Basic = (args) => <SimpleStatBox {...args} />
Basic.args = {
	isPlaceholder: false,
	title: '총 반송량',
	duration: '',
	value: '69,800',
	unit: '개',
}

export const Empty = (args) => <SimpleStatBox {...args} />
Empty.args = {
	isPlaceholder: false,
	title: '총 반송량',
	duration: '',
	value: '',
	unit: '개',
}

export const Placeholder = (args) => <SimpleStatBox {...args} />
Placeholder.args = {
	isPlaceholder: true,
	title: '',
	duration: '',
	value: '',
	unit: '',
}

const datalistProps = {
	unit: 'GB',
	data: [
		{
			label: 'use',
			value: 7.9,
		},
		{
			label: 'total',
			value: 15.8,
		},
	],
}

export const Extension1 = (args) => {
	return (
		<Wrapper>
			<SimpleStatBox {...args}>
				<SimpleStatBox.DataList {...datalistProps} />
			</SimpleStatBox>
		</Wrapper>
	)
}
Extension1.args = {
	isPlaceholder: false,
	title: 'Memory',
	duration: '',
	value: '50',
	unit: '%',
}

export const Extension2 = (args) => {
	const range = 60 * 10 * 1000
	const interval = 1000 * 3
	const [data, updateData] = useSelfUpdatedData(range, interval)

	useInterval(() => {
		updateData(Math.random() * 100)
	}, interval)

	return (
		<Wrapper>
			<SimpleStatBox {...args}>
				<SimpleStatBox.InlineLineChart name="utilization" data={data} />
			</SimpleStatBox>
		</Wrapper>
	)
}
Extension2.args = {
	isPlaceholder: false,
	title: 'Utilization',
	duration: '',
	value: '67.78',
	unit: '%',
}
