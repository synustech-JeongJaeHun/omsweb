// @ts-nocheck
import * as React from 'react'
import { isFullEmpty } from '@daimre/shared'
import styled from '@emotion/styled'
import { TitleBarlineSet, GlobalStyle } from '@daimre/component-library'

const Wrapper = styled.div`
  height: 100%;
`

const exStat = TitleBarlineSet.exStatData
const placeholderData = TitleBarlineSet.exEmptyData.normaltr
const genNormaltr = TitleBarlineSet.genNormaltr

const Test = () => {
  const [isPlaceholder, updateState] = React.useState(true)
	const [ data, setData ] = React.useState(placeholderData)

  React.useEffect(() => {
		const id = setTimeout(() => {
			updateState(false)
			setData({
				pageVariant: 'normaltr',
				stats: exStat.normaltr,
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

export default Test
