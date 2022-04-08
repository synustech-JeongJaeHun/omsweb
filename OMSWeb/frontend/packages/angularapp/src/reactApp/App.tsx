import * as React from 'react'
import * as R from 'ramda'
import { GlobalStyle } from '@daimre/component-library'
import styled from '@emotion/styled'
import { NormalTr, Trend, AbnormalTr, Alarm } from './screens'

const Wrapper = styled.div`
  height: 100%;
`


const App: React.FC<Props> = ({ location }: Props) => {

  const { pathname } = location
  const path = R.toLower(pathname)

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

  return (
    <Wrapper>
      <GlobalStyle />
      {renderPath()}
    </Wrapper>

  )
}

interface Props {
  location: any
}

export default App
