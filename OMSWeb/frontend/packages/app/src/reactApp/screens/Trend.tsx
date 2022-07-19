// @ts-nocheck
import * as React from 'react'
import * as R from 'ramda'
import { isFullEmpty, useSelfUpdatedData } from '@daimre/shared'
import styled from '@emotion/styled'
import { Trend, GlobalStyle } from '@daimre/component-library'
import { useQuery } from 'react-query'
import { getAgt } from '../utils'

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
`

const placeholderData = {
	stats: { cpu: {}, memory: {} },
	table: [],
	donuts: [[], []],
}

const exData = Trend.exData
const makeData = Trend.makeData
const agt = getAgt()

const TrendWrapper: React.FC = () => {
	const range = 60 * 10 * 1000
	const interval = 1000 * 3
	const [utilData, updateUtilData] = useSelfUpdatedData(range, interval)
	const [dtData, updateDtData] = useSelfUpdatedData(range, interval)

	const { data } = useQuery(
		['trend'],
		async () => {
			const ret = await agt.trend()
			return makeData(ret.data)
		},
		{
			placeholderData: placeholderData,
			refetchInterval: 5000,
		},
	)

	useQuery(
		['utilization'],
		async () => {
			const ret = await agt.utilization()
			const value = R.path(['data', 'value'], ret)
			updateUtilData(value)
		},
		{
			refetchInterval: 5000,
		},
	)

	useQuery(
		['deliveryTime'],
		async () => {
			const ret = await agt.deliveryTime()
			const value = R.path(['data', 'value'], ret)
			updateDtData(value)
		},
		{
			refetchInterval: 5000,
		},
	)

	return (
		<Wrapper>
			<Trend
				data={data}
				utilization={utilData}
				deliveryTime={dtData}
				isPlaceholder={false}
			/>
		</Wrapper>
	)
}

export default TrendWrapper
