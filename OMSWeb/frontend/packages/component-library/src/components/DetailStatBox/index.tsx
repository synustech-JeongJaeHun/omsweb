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
import { numberWithCommas, isFullEmpty } from '@daimre/shared'

type StyleType = {
	isPlaceholder: boolean
}

const Wrapper = styled.div<StyleType>`
	display: flex;
	min-width: 220px;
	height: 110px;
	border: 1px solid #e2e2e2;
	padding: 11px 15px 9px 14px;
	margin-right: 5px;
	margin-bottom: 5px;

	.summary {
		margin-right: 40px;

		.box {
			&-header {
				display: flex;
				justify-content: space-between;
				margin-bottom: 12px;

				&-title {
					color: #1a1a1a;
					font-size: 14px;
				}

				&-duration {
					color: #a0a0a0;
				}
			}
			&-body {
				&-label {
					color: #7e7e7e;
					font-size: 12px;
					line-height: 1;
					margin-bottom: 5px;
				}

				&-value {
					font-size: 28px;
					font-weight: bold;
					line-height: 1;
				}

				&-unit {
					font-size: 15px;
				}
			}
		}
	}

	.detail {
		margin-top: 2px;

		dl {
			display: flex;
			min-width: 110px;
			justify-content: space-between;
			align-items: center;
			line-height: 1;
			margin-bottom: 5px;

			&:last-of-type {
				margin-bottom: 0;
			}

			dt {
				font-size: 12px;
				margin-right: 15px;
			}

			dd {
				font-size: 15px;
				text-align: right;
				font-weight: bold;
			}
		}
	}

	${({ isPlaceholder }) => isPlaceholder && css`
		.box {
			&-header {
				&-title {
					width: 50px;
					height: 23px;
					background-color: rgba(0, 0, 0, 0.1);
				}
			}
			&-body {
				&-label {
					width: 20px;
					height: 12px;
					background-color: rgba(0, 0, 0, 0.1);
				}
				.box-body-values {
					.box-body-value {
						display: inline-block;
						width: 100px;
						height: 31px;
						background-color: rgba(0, 0, 0, 0.2);
					}
				}
			}
		}

		dt {
			width: 21px;
			height: 12px;
			background-color: rgba(0, 0, 0, 0.1);
		}

		dd {
			width: 67px;
			height: 15px;
			background-color: rgba(0, 0, 0, 0.1);
		}

	`}
`

const placeholderProps = {
	title: '',
	subLabel: '',
	value: ' ',
	unit: ' ',
	details: [
		{
			label: '',
			value: ''
		},
		{
			label: '',
			value: ''
		},
		{
			label: '',
			value: ''
		},
		{
			label: '',
			value: ''
		},
	],
	key: '',
}

const DetailStatBox: React.FC<Props> = ({
	title,
	subLabel,
	details,
	value,
	unit,
	isPlaceholder
}) => {

	if (isPlaceholder) {
		return (
			<Wrapper isPlaceholder={isPlaceholder}>
			<div className="summary">
				<div className="box-header">
					<div className="box-header-title"></div>
				</div>
				<div className="box-body">
					<div className="box-body-label"></div>
					<div className="box-body-values">
						<span className="box-body-value"></span>
						<span className="box-body-unit"></span>
					</div>
				</div>
			</div>
			<div className="detail">
				{placeholderProps.details.map((item, i) => {
					return (
						<dl key={i.toString()}>
							<dt>{item.label}</dt>
							<dd>{item.value}</dd>
						</dl>
					)
				})}
			</div>
		</Wrapper>
		)
	}

	return (
		<Wrapper isPlaceholder={isPlaceholder}>
			<div className="summary">
				<div className="box-header">
					<div className="box-header-title">{title}</div>
				</div>
				<div className="box-body">
					<div className="box-body-label">{subLabel}</div>
					<div className="box-body-values">
						<span className="box-body-value">{value}</span>
						<span className="box-body-unit">{unit}</span>
					</div>
				</div>
			</div>
			<div className="detail">
				{details.map((item, i) => {
					return (
						<dl key={i.toString()}>
							<dt>{item.label}</dt>
							<dd>{item.value}</dd>
						</dl>
					)
				})}
			</div>
		</Wrapper>
	)
}

DetailStatBox.defaultProps = {
	title: '',
	subLabel: '',
	details: [],
	value: '',
	unit: '',
	isPlaceholder: false
}

interface Props {
	title: string
	subLabel: string
	value: number | string
	unit: string
	details: {
		label: string
		value: string | number
	}[]
	key?: string
	isPlaceholder?: boolean
}

export default DetailStatBox
