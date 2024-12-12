import * as React from 'react'
import styled from '@emotion/styled'
import { useWindowSize } from '@synusdev/shared'

export const PaneBodyContext = React.createContext({ width: 0 })

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`

const ContentPaneBody: React.FC<Props> & any = ({
  nav = 'tree',
  children,
}: Props) => {
  const ref = React.useRef(null)
  const [width, updateWidth] = React.useState(0)
  const windowSize = useWindowSize()


  React.useEffect(() => {
    updateWidth(ref.current.offsetWidth)
  }, [ref, windowSize, nav])

  return (
    <Wrapper ref={ref}>
      <PaneBodyContext.Provider value={{ width }}>
        {children}
      </PaneBodyContext.Provider>
    </Wrapper>
  )
}

ContentPaneBody.PaneBodyContext = PaneBodyContext

interface Props {
  nav?: string
  children?: React.ReactNode
}

export default ContentPaneBody
