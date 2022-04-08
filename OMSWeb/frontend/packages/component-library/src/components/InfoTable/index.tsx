import * as React from 'react'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { color } from '@daimre/styles'
import { isFullEmpty } from '@daimre/shared'

type StyleType = {
	isPlaceholder: boolean
}


const Wrapper = styled.div<StyleType>`
	table {
		width: 100%;
		border: none;
		border-top: 1px solid ${color.line};
		// border-bottom: 1px solid ${color.line};
		border-spacing: 0px;
		border-collapse: collapse;
		font-size: 12px;

		tr {
			height: 31px;
			width: 100%;
			display: flex;

			td {
				border-spacing: 0px;
				border: none;
				border-bottom: 1px solid ${color.line};
				padding: 0;
				height: 31px;
				width: 50%;

				&.full {
					width: 100%;
				}
			}

			// &:last-child {
			//   td {
			//     border-bottom: none;
			//   }
			// }
		}

		dl {
			display: flex;
			width: 100%;
			height: 30px;
			align-items: center;

			dt {
				background-color: #efefef;
				height: 100%;
				color: #434343;
				padding-left: 16px;
				flex: 0 0 240px;
				display: flex;
				align-items: center;
			}
			dd {
				display: flex;
				padding-left: 16px;
				padding-right: 33px;

				span.empty {
					padding-left: 20px;
				}
			}
		}
	}

	${({isPlaceholder}) => isPlaceholder && css`
		span.label {
			width: 80px;
			height: 15px;
			background-color: rgba(0, 0, 0, 0.08);
		}
		span.empty {
			width: 180px;
			height: 15px;
			background-color: rgba(0, 0, 0, 0.08);
		}
	`}
`

const makeTable = (data) =>
	data.map((item, i) => {
		const { length } = item
		if (length === 1) {
			return (
				<tr key={i.toString()}>
					<td className="full">
						<dl>
							<dt><span className="label">{item[0].label}</span></dt>
							<dd>
								{item[0].value === '' ? (
									<span className='empty' />
								) : (
									item[0].value
								)}
							</dd>
						</dl>
					</td>
				</tr>
			)
		}
		return (
			<tr key={i.toString()}>
				{item.map((cell, j) => (
					<td key={j.toString()}>
						<dl>
							<dt><span className="label">{cell.label}</span></dt>
							<dd>
								{cell.value === '' ? <span className='empty' /> : cell.value}
							</dd>
						</dl>
					</td>
				))}
			</tr>
		)
	})

const InfoTable: React.FC<Props> = ({ data, isPlaceholder }: Props) => {
	const tempData = isPlaceholder ? Array.from({ length: 8 }, () => [{
		label: '',
		value: ''
	}]) : data

	return (
		<Wrapper isPlaceholder={isPlaceholder}>
			<table>
				<tbody>{makeTable(tempData)}</tbody>
			</table>
		</Wrapper>
	)
}

InfoTable.defaultProps = {
	data: [],
	isPlaceholder: false
}

interface Props {
	data: {
		label: string
		value: string
	}[][]
	isPlaceholder?: boolean
}

export default InfoTable
