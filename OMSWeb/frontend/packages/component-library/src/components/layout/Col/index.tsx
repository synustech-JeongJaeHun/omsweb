import * as React from 'react'

import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { GridContext, notEq } from '../Container'

type StyledProps = Partial<Props> & {
  canvasWidth?: number
}

const columns = {
  default: 12,
}

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

  ${({ noGutter }) =>
    noGutter &&
    css`
      padding: 0;
    `}

  ${({ col }) => {
    const width = `${(100 / columns.default) * col * 1}%`
    return css`
      flex-basis: ${width};
      max-width: ${width};
    `
  }}

  ${({ off }) => css`
    margin-left: ${`${(100 / columns.default) * off * 1}%`};
  `}

  ${({ column, gutter, bottomGutter }) =>
    column &&
    css`
      flex-basis: auto;
      margin-bottom: ${notEq(gutter, bottomGutter) * 2}px;
    `}

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

  ${({ order }) => {
    switch (order) {
      case 'first':
        return css`
          order: -1;
        `
      case 'last':
        return css`
          order: 1;
        `
      default:
        return css``
    }
  }}
`
const Col: React.FC<Props> = ({
  children = null,
  col = 1,
  off = 0,
  ...props
}: Props) => {
	const contextProps = React.useContext(GridContext)

	return (
		<Column col={col} off={off} {...contextProps} {...props}>
			{children}
		</Column>
	)
 }

interface Props {
  col: number
  children?: React.ReactNode
  off?: number
  column?: boolean
  gutter?: number
  bottomGutter?: number
  v?: 'top' | 'middle' | 'bottom'
  equalHeight?: boolean
  noGutter?: boolean
  order?: 'first' | 'last'
}

export default Col
