import * as React from 'react'

import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { PaneBodyContext } from '../../ContentPaneBody'
import { calcBreakpoint } from '@daimre/shared'
import { GridContext, notEq } from '../Container'

type StyledProps = Partial<Props> & {
  canvasWidth?: number
}

const columns = {
  default: 12,
}

const calcWidth = (col) => (100 / columns.default) * col * 1

const Column = styled.div<Partial<StyledProps>>`
  flex: 0 0 auto;
  margin-left: 0;
  margin-right: 0;

  ${({ equalHeight }) =>
    equalHeight &&
    css`
      display: flex;
    `}

  ${({ gutter, bottomGutter }) => {
    const bGutter = notEq(gutter, bottomGutter)
    return css`
      padding: ${gutter}px;
      padding-top: ${bGutter}px;
      padding-bottom: ${bGutter}px;
    `
  }}

  ${({ v }) => {
    switch (v) {
      case 'top':
        return css`
          align-self: flex-start;
        `
      case 'middle':
        return css`
          align-self: center;
        `
      case 'bottom':
        return css`
          align-self: flex-end;
        `
      default:
        return css``
    }
  }}

  ${({ canvasWidth, col, sm, md, lg }) => {
    const breakpoint = calcBreakpoint(canvasWidth)
    let width
    switch (breakpoint) {
      case 'sm':
        width = `${calcWidth(sm)}%`
        break
      case 'md':
        width = `${calcWidth(md)}%`
        break
      case 'lg':
        width = `${calcWidth(lg)}%`
        break
      default:
        width = `${calcWidth(col)}%`
        break
    }

    return css`
      flex-basis: ${width};
      max-width: ${width};
    `
  }}
`

const RCol: React.FC<Props> = ({
  children = null,
  col = 1,
  sm = 1,
  md = 1,
  lg = 1,
  ...props
}: Props) => {
	const contextProps = React.useContext(GridContext)
	const { width } = React.useContext(PaneBodyContext)

	return (
		<Column
			col={col}	sm={sm} md={md} lg={lg} canvasWidth={width}
			{...contextProps}
			{...props}
		>
			{children}
		</Column>
	)
}

interface Props {
  col: number
  sm?: number
  md?: number
  lg?: number
  children?: React.ReactNode
  gutter?: number
  bottomGutter?: number
  v?: 'top' | 'middle' | 'bottom'
  equalHeight?: boolean
}

export default RCol
