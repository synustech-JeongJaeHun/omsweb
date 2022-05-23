// @ts-nocheck
import * as React from 'react'
import { isFullEmpty } from '@daimre/shared'
import styled from '@emotion/styled'
import { Trend, GlobalStyle } from '@daimre/component-library'
import { useQuery } from 'react-query'
import { getAgt } from '../utils'

const Wrapper = styled.div`
	height: 100%;
`

const placeholderData = {
	stats: [
		{
			value: '',
		},
		{
			value: '',
		},
		{
			value: '',
		},
		{
			value: '',
		},
	],
	table: [],
	donuts: [[], []],
}

const exData = Trend.exData

// const getData = () => new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve(exData)
//   }, 3000)
// })

const TrendWrapper: React.FC = () => {
	const agt = getAgt()
	const [isPlaceholder, updatePlaceholder] = React.useState(true)
	const [data, setData] = React.useState(placeholderData)

	React.useEffect(() => {
		const id = setTimeout(() => {
			updatePlaceholder(false)
			setData(exData)
		}, 1000)

		return () => clearTimeout(id)
	}, [])

	// const { data, status } = useQuery('systemStates', async () => {
	//   const ret = await getData()
	//   updatePlaceholder(false)
	//   return ret
	// }, {
	//   placeholderData,
	// })

	return (
		<>
			<Trend data={data} isPlaceholder={isPlaceholder} />
		</>
	)
}

export default TrendWrapper
