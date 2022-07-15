/**
 *
 * Table
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import { useEffectOnce } from '@daimre/shared'

// import 'devextreme/dist/css/dx.light.compact.css'
// import './base.css'
import {
	DataGrid,
	Column,
	RequiredRule,
	Scrolling,
} from 'devextreme-react/data-grid'
import { Button } from 'devextreme-react/button'

import { Workbook } from 'exceljs'
import saveAs from 'file-saver'
import { exportDataGrid } from 'devextreme/excel_exporter'

type StyleType = {}

const Wrapper = styled.div`
	.dx-datagrid-headers {
		color: #000000;
		background-color: #f2f2f2;
		// border: none;
		border-bottom: none;
	}

	.dx-datagrid-text-content {
		font-weight: 400;
	}

	.dx-scrollable-container {
		overflow-x: hidden !important;
		overflow-y: hidden !important;

		&::-webkit-scrollbar {
			width: 5px;
		}

		&::-webkit-scrollbar-thumb {
			background-color: #ccc;
		}
	}

	table {
		border: none;
	}

	.dx-widget:hover {
		.dx-scrollable-container {
			overflow-y: auto !important;
		}
	}

`

// prettier-ignore
const Table: React.FC<Props & any> = React.forwardRef(
(
	{
		height,
		exportFilename,
		hasPaging,
		data,
		onSorting,
	}: Props,
	inRef: any
) => {
		const ref = React.useRef(null)
		const {
			header: tableHeader,
			body: tableBody
		} = data


		const exportGrid = (e) => {
			const workbook = new Workbook()
			const worksheet = workbook.addWorksheet('Sales')
			exportDataGrid({
				worksheet,
				component: e.component,
			}).then(() => {
				workbook.xlsx.writeBuffer().then((buffer) => {
					saveAs(
						new Blob([buffer], { type: 'application/octet-stream' }),
						`${exportFilename}.xlsx`,
					)
				})
			})
			e.cancel = true
		}

		React.useImperativeHandle(inRef, () => ref.current, [ref])

		const handleOptionChanged = (e) => {
			const { name, fullName, value } = e

			if (R.test(/sortOrder/ig, fullName)) {
				const index = R.compose(
					Number,
					R.head,
					R.match(/(\d+)/),
					R.toString,
				)(fullName)
				const columnNames = R.pluck<string, any>('dataField', tableHeader)
				const sortedOpt = {
					name: columnNames[index],
					value
				}

				onSorting && onSorting(sortedOpt)
			}

		}

		return (
			<Wrapper>
				<DataGrid
					height={height}
					showBorders={true}
					noDataText='no data'
					dataSource={tableBody}
					columnAutoWidth={true}
					allowColumnReordering={true}
					hoverStateEnabled={true}
					onExporting={exportGrid}
					ref={ref}
					onOptionChanged={handleOptionChanged}
				>
					{
						tableHeader.map((header, i) => {
							return <Column {...header} key={i.toString()} />
						})
					}
					{!hasPaging && <Scrolling mode="virtual" />}
				</DataGrid>
			</Wrapper>
		)
	},
)

Table.defaultProps = {
	height: 300,
	exportFilename: 'file',
	hasPaging: false,
	data: {
		header: [],
		body: [],
	},
	onSorting: (e) => {},
}

interface Props {
	height?: number
	exportFilename?: string
	hasPaging?: boolean
	onSorting?: (e: any) => void
	data?: {
		header: any[]
		body: any[]
	}
}

export default Table
