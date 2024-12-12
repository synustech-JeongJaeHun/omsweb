/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
// @ts-nocheck
import * as React from 'react'
import { Global } from '@emotion/react'
import styled from '@emotion/styled'
import ClipLoader from 'react-spinners/ClipLoader'
import { color, globalStyle } from '@synusdev/styles'

type StyledProps = {
	noMarginBottom?: boolean
	left?: string
	top?: string
}

export const CompTitle = styled.h4<StyledProps>`
	font-size: 14px;
	font-weight: bold;

	margin-bottom: ${({ noMarginBottom }) => (noMarginBottom ? 0 : '18px')};
	color: white;
	/* padding-left: 3px; */
`
export const StatBoxListWrapper = styled.div`
	margin-top: 30px;
`

const Loader = styled.div<StyledProps>`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 3;
	background-color: rgba(10, 15, 29, 0.7);
	display: flex;
	padding-left: ${({ left }) => left || '25px'};
	padding-top: ${({ top }) => top || '25px'};
`

export const Loading = ({ left = '25px', top = '25px' }) => (
	<Loader left={left} top={top}>
		<ClipLoader size={30} color={color.primary} />
	</Loader>
)

export const GlobalStyle = () => <Global styles={globalStyle} />
