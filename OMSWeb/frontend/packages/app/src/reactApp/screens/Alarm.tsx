// @ts-nocheck
import * as React from 'react'
import { isFullEmpty } from '@daimre/shared'
import styled from '@emotion/styled'
import { TitleBarlineSet, GlobalStyle } from '@daimre/component-library'

const Wrapper = styled.div`
  height: 100%;
`

const key = 'alarm'

const exStat = TitleBarlineSet.exStatData
const placeholderData = TitleBarlineSet.exEmptyData[key]
const genNormaltr = TitleBarlineSet.genNormaltr

const Comp = () => {
  const [isPlaceholder, updateState] = React.useState(true)
	const [ data, setData ] = React.useState(placeholderData)

  React.useEffect(() => {
		const id = setTimeout(() => {
			updateState(false)
			setData({
				pageVariant: key,
				stats: exStat[key],
				data: genNormaltr('overview')
			})
		}, 1000)

		return () => clearTimeout(id)
	}, [])

	return (
		<Wrapper>
			<TitleBarlineSet
        {...data}
        isPlaceholder={isPlaceholder} />
		</Wrapper>
	)
}

export default Comp
