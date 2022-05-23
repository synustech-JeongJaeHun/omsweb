// @ts-nocheck
import * as React from 'react'
import { isFullEmpty } from '@daimre/shared'
import styled from '@emotion/styled'
import { OverviewAbnormal, GlobalStyle } from '@daimre/component-library'

const Wrapper = styled.div`
	height: 100%;
`

const exEmptyData = OverviewAbnormal.exEmptyData
const exData = OverviewAbnormal.exData

const Comp = () => {
	const [isPlaceholder, updateState] = React.useState(true)
	const [data, setData] = React.useState(exEmptyData)

	React.useEffect(() => {
		const id = setTimeout(() => {
			updateState(false)
			setData(exData)
		}, 1000)

		return () => clearTimeout(id)
	}, [])

	return <OverviewAbnormal {...data} isPlaceholder={isPlaceholder} />
}

export default Comp
