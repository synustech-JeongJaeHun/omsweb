import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'

const Wrapper = styled.div<Partial<Props>>`
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '100%'};

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ${({ scroll }) => {
    switch (scroll) {
      case 'x':
        return css`
          overflow-x: auto;
          overflow-y: hidden;
        `
      case 'y':
        return css`
          overflow-x: hidden;
          overflow-y: auto;
        `
      case 'both':
        return css`
          overflow: auto;
        `
      default:
        return css`
          overflow: hidden;
        `
    }
  }}
`

const Scrollable: React.FC<Props> = ({
  children,
  width,
  height,
  scroll = 'none',
  ...props
}: Props) => (
  <Wrapper width={width} height={height} scroll={scroll} {...props}>
    {children}
  </Wrapper>
)

interface Props {
  scroll: 'none' | 'x' | 'y' | 'both'
  width?: string
  height?: string
  children?: React.ReactNode
}

export default Scrollable
