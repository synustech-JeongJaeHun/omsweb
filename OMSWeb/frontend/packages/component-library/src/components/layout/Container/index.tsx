// @ts-nocheck

import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import * as R from 'ramda'

export const notEq = (a: number, b: number): number => (R.equals(a, b) ? a : b)

const Grid = styled.div<Partial<Props>>`
  display: flex;
  flex-wrap: wrap;

  ${({ gutter, bottomGutter }) => {
    const value = `${-1 * gutter}px`
    const _bottomGutter = `${-1 * notEq(gutter, bottomGutter)}px`
    return css`
      margin: ${value};
      margin-top: ${_bottomGutter};
      margin-bottom: ${_bottomGutter};
    `
  }}

  ${({ noGutter }) =>
    noGutter &&
    css`
      margin: 0;
    `}

  ${({ h }) => {
    switch (h) {
      case 'center':
        return css`
          justify-content: center;
        `
      case 'right':
        return css`
          justify-content: flex-end;
        `
      case 'left':
        return css`
          justify-content: flex-start;
        `
      case 'spaceBetween':
        return css`
          justify-content: space-between;
        `
      case 'spaceAround':
        return css`
          justify-content: space-around;
        `
      default:
        return css``
    }
  }}

  ${({ v }) => {
    switch (v) {
      case 'top':
        return css`
          align-items: flex-start;
        `
      case 'middle':
        return css`
          align-items: center;
        `
      case 'bottom':
        return css`
          align-items: flex-end;
        `
      default:
        return css``
    }
  }}

  ${({ reverse }) =>
    reverse &&
    css`
      flex-direction: row-reverse;
    `}

  ${({ column, gutter, bottomGutter }) =>
    column &&
    css`
      flex-direction: column;
      margin-bottom: ${-1 * 2 * notEq(gutter, bottomGutter)}px;
    `}
`

const defaultProps = {
  gutter: 10,
  bottomGutter: 10,
  column: false,
  noGutter: false,
  equalHeight: false,
}

export const GridContext = React.createContext({
  ...defaultProps,
})

const getBottomGutter = (gutter, bGutter) => {
  if (bGutter !== defaultProps.bottomGutter) {
    return bGutter
  }
  if (bGutter !== gutter) {
    return gutter
  }
  if (bGutter === defaultProps.bottomGutter) {
    return defaultProps.bottomGutter
  }

  return gutter
}

const Container: React.FC<Props> & any = ({
  gutter,
  bottomGutter,
  ...etcProps
}: Props) => {
	const contextProps = React.useContext(GridContext)

  const _bottomGutter = getBottomGutter(gutter, bottomGutter)
  const props = { gutter, bottomGutter: _bottomGutter, ...etcProps }
  const _props = R.keys(defaultProps).reduce((acc: any, key) => {
    if (props[key] !== defaultProps[key]) {
      acc[key] = props[key]
    }
    return acc
  }, props)


	const mergedProps = R.mergeRight(contextProps, _props)
	const contextValue = R.pick(R.keys(defaultProps), mergedProps)

  return (
		<Grid {...mergedProps}>
			<GridContext.Provider value={{ ...contextValue }}>
				{props.children}
			</GridContext.Provider>
		</Grid>
	)
}

Container.defaultProps = defaultProps
Container.GridContext = GridContext

interface Props {
  children?: React.ReactNode
  gutter?: number
  bottomGutter?: number
  h?: 'center' | 'right' | 'left' | 'spaceBetween' | 'spaceAround'
  v?: 'top' | 'middle' | 'bottom'
  reverse?: boolean
  column?: boolean
  noGutter?: boolean
  equalHeight?: boolean
}

export default Container
