import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { NormalTr, Trend, AbnormalTr, Alarm } from './screens'
import { globalStyle } from '@synusdev/styles'
import createCache from '@emotion/cache'
import { cache, css } from '@emotion/css'
import { serializeStyles } from '@emotion/serialize'

const globalThemeCache = createCache({ key: 'global-theme' })

const themeStyles = (theme) => css`
	${globalStyle}
`

function injectThemedGlobal(...args) {
	const serialized = serializeStyles(args, cache.registered)

	if (!globalThemeCache.inserted[serialized.name]) {
		globalThemeCache.insert('', serialized, globalThemeCache.sheet, true)
	}
}

function flushThemedGlobals() {
	globalThemeCache.sheet.flush()
	globalThemeCache.inserted = {}
	globalThemeCache.registered = {}
}

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
`

const App: React.FC<Props> = ({ location }: Props) => {
	const { pathname } = location
	const path = R.toLower(pathname)

	React.useEffect(() => {
		injectThemedGlobal`
      ${themeStyles('global')}
    `

		return () => {
			flushThemedGlobals()
		}
	}, [])

	const renderPath = React.useCallback(() => {
		switch (path) {
			case '/reports/normaltr':
				return <NormalTr />
			case '/reports/kpi':
				return <Trend />
			case '/reports/abnormaltr':
				return <AbnormalTr />
			case '/reports/alarm':
				return <Alarm />
			default:
				return <NormalTr />
		}
	}, [path])

	return <Wrapper>{renderPath()}</Wrapper>
}
interface Props {
	location: any
}
export default App
