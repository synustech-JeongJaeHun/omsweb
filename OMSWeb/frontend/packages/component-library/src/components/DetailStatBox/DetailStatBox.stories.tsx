import * as React from 'react'
import DetailStatBox from './index'
import styled from '@emotion/styled'
import { css } from '@emotion/react'

export default {
	title: '@daimre-ui/DetailStatBox',
	component: DetailStatBox,
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

export const Basic = (args) => <DetailStatBox {...args} />
Basic.args = {}

export const Ex1 = (args) => <DetailStatBox {...args} />
Ex1.args = {
	title: '기간별 평균 실패량',
	subLabel: '시간당',
	details: [
		{
			label: '연간',
			value: 63,
		},
		{
			label: '월별',
			value: 15.75,
		},
		{
			label: '주간',
			value: 3.93,
		},
		{
			label: '일별',
			value: 1.01,
		},
	],
	value: 0.04,
	unit: '',
}

export const Ex2 = (args) => <DetailStatBox {...args} />
Ex2.args = {
	title: '소요시간',
	subLabel: '평균',
	value: '9분 38초',
	unit: '',
	details: [
		{
			label: '최대',
			value: '16분 49초',
		},
		{
			label: '최소',
			value: '3분 10초',
		},
		{
			label: '편차',
			value: '5분 15초',
		},
	],
}

export const Empty = (args) => <DetailStatBox {...args} />
Empty.args = {
	title: '소요시간',
	subLabel: '평균',
	value: '',
	unit: '',
	details: [
		{
			label: '최대',
			value: '',
		},
		{
			label: '최소',
			value: '',
		},
		{
			label: '편차',
			value: '',
		},
	],
}

export const Placeholder = (args) => <DetailStatBox {...args} />
Placeholder.args = {
	isPlaceholder: true,
	value: ''
}

