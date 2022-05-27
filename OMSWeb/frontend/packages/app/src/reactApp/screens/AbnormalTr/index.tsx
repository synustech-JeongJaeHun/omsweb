// @ts-nocheck
import * as React from 'react'
import { bdFormat, isFullEmpty } from '@daimre/shared'
import styled from '@emotion/styled'
import { useQuery } from 'react-query'
import { OverviewAbnormal, GlobalStyle } from '@daimre/component-library'
import { getAgt } from '../../utils'
import { useImmer } from 'use-immer'
import da from './dataAdapter'

const Wrapper = styled.div`
	height: 100%;
`

const placeholderData = OverviewAbnormal.exEmptyData
const exData = OverviewAbnormal.exData
const agt = getAgt()

const Comp = () => {
	const [state, updateState] = useImmer({
		startStr: bdFormat(1),
		endStr: bdFormat(0),
	})

	const { data: dic } = useQuery(
		['abnormaltr', 'labels'],
		async () => {
			const ret = await agt.labels()
			const temp = ret.data
			return temp.reduce((acc, item) => {
				const { id, label } = item
				acc[label] = id
				return acc
			}, {})
		},
		{
			placeholderData: {},
		},
	)

	const { data: stats, isFetching: isStatLoading } = useQuery(
		['abnormaltr', 'stats'],
		async () => {
			const ret = await agt.stats({ variant: 'abnormaltr' })
			return da.stats(ret.data)
		},
		{
			placeholderData: placeholderData.stats,
			// refetchInterval: 10000
		},
	)

	const { data: chartData, isFetching: isChartLoading } = useQuery(
		['abnormaltr', 'charts', state['startStr'], state['endStr']],
		async () => {
			const { startStr, endStr } = state
			const ret = await agt.charts({
				variant: 'abnormaltr',
				section: 'overview',
				selected_item: '',
				start: startStr,
				end: endStr,
			})
			return ret.data
		},
		{
			placeholderData: placeholderData.data,
			// refetchInterval: 10000
		},
	)

	const handleDateChange = ({ start, end }) => {
		const startStr = start.format('YYYY-MM-DD')
		const endStr = end.format('YYYY-MM-DD')

		updateState((draft) => {
			draft.startStr = startStr
			draft.endStr = endStr
		})
	}

	return (
		<OverviewAbnormal
			stats={stats}
			data={chartData}
			isStatPlaceholder={isStatLoading}
			isChartPlaceholder={isChartLoading}
			startDay={state['startStr']}
			endDay={state['endStr']}
			onDateChange={handleDateChange}
		/>
	)
}

export default Comp
