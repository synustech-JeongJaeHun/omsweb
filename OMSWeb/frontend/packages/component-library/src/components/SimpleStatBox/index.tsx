// @ts-nocheck
/**
 *
 * SimpleStatBox
 *
 */

import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import { isNotFullEmpty, isFullEmpty } from '@daimre/shared'
import Loader from '../Loader'
import Inline from '../charts/Inline'

type StyleType = {
	isPlaceholder: boolean
}

const Wrapper = styled.div<StyleType>`
	height: 110px;
	min-width: 170px;
	border: 1px solid #e2e2e2;
	padding: 11px 15px 9px 14px;
	margin-right: 5px;
	margin-bottom: 5px;
	display: flex;

	.left {
		flex: 1 1 auto;
	}

	.box {
		&-header {
			display: flex;
			justify-content: space-between;
			margin-bottom: 18px;

			&-title {
				color: #1a1a1a;
			}

			&-duration {
				color: #a0a0a0;
			}
		}
		&-body {
			font-size: 40px;
			font-weight: bold;
			line-height: 1;

			&-unit {
				font-size: 15px;
			}
		}
	}

	${({ isPlaceholder }) => isPlaceholder && css`
		.box {
			&-header {
				&-title {
					width: 60px;
					height: 23px;
					background-color: rgba(0, 0, 0, 0.05);
				}

				&-duration {
					width: 37px;
					height: 23px;
					background-color: rgba(0, 0, 0, 0.05);
				}
			}
			&-body {
				width: 120px;
				height: 40px;
				background-color: rgba(0, 0, 0, 0.05);
			}
		}
	`}
`

const DataListWrapper = styled.div`
	font-size: 12px;
	color: #72809F;
	display: flex;
	width: 100px;
	height: 100%;
	padding-bottom: 12px;
	align-items: flex-end;

	& > .inner-wrapper {
		width: 100%;
	}

	dl {
		display: flex;
		width: 100%;
		text-align: right;
		line-height: 1;
		margin-bottom: 5px;

		&:last-of-type {
			margin-bottom: 0;
		}

		dt {
			width: 40px;
		}
		dd {
			width: 60px;
		}
	}
`

const Datalist = ({
	unit,
	data
}) => {

	return (
		<DataListWrapper>
			<div className='inner-wrapper'>
				{
					data.map((list, i) => {
						const { label, value } = list
						return (
							<dl key={i.toString()}>
								<dt>{label}</dt>
								<dd>{value}{unit}</dd>
							</dl>
						)
					})
				}
			</div>
		</DataListWrapper>
	)
}

Datalist.defaultProps = {
	unit: 'GB',
	data: [],
}

const InlineLineChartWrapper = styled.div`
	margin-left: 37px;
`

const InlineLineChart: React.FC = ({ data }) => {

	return (
		<InlineLineChartWrapper>
			<Inline data={data} />
		</InlineLineChartWrapper>
	)
}

const SimpleStatBox: React.FC<Props> & any = ({
	title,
	duration,
	value,
	unit,
	key,
	isPlaceholder,
	children
}: Props) => {

	return (
		<Wrapper isPlaceholder={isPlaceholder}>
			<div className="left">
				<div className="box-header">
					<div className="box-header-title">{title}</div>
					<div className="box-header-duration">{duration}</div>
				</div>
				<div className="box-body">
					{value && <span className="box-body-value">{value}</span>}
					{unit && <span className="box-body-unit">{unit}</span>}
				</div>
			</div>
			<div className="right">
				{children}
			</div>
		</Wrapper>
	)
}

SimpleStatBox.defaultProps = {
	title: '',
	duration: '',
	value: '',
	unit: '',
	isPlaceholder: false
}

SimpleStatBox.DataList = Datalist
SimpleStatBox.InlineLineChart = InlineLineChart

interface Props {
	title: string
	duration: string
	value: string | number
	unit: string | number
	key?: string
	isPlaceholder?: boolean
}

export default SimpleStatBox
