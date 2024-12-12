/**
 *
 * BarlineTable
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@synusdev/styles'
import Barline from '../../charts/Barline'
import Table from '../../Table'
import { useEffectOnce } from '@synusdev/shared'
import BarlineRange from '../../charts/BarlineRangeSelector'

type StyleType = {}

const Wrapper = styled.div`
	& > .title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 12px;
		border-bottom: 1px solid #707070;
		margin-bottom: 30px;

		.texts {
			font-size: 16px;
			line-height: 1;
			.text {
			}
			.subtext {
				padding-left: 4px;
			}
		}
	}

	& > .table-wrapper {
		height: 300px;
	}
`

const BarlineRangeTable: React.FC<Props> = ({
	title,
	subtext,
	exportFilename,
	data,
	onClick,
	onClickClose,
	isTimeseries,
}: Props) => {
	const [sortedData, updateSortedData] = React.useState(data)
	const tableRef: any = React.useRef(null)

	useEffectOnce(() => {
		updateSortedData(data)
	}, [data])

	const handleExport = (e) => {
		if (tableRef.current) {
			tableRef.current.instance.exportToExcel(false)
		}
	}

	const handleSorted = (sortedOpt) => {
		const { header, body: tbody } = data
		const { name, value } = sortedOpt
		const sortingOpt: any =
			value === 'asc'
				? R.ascend<any>(R.prop(name))
				: R.descend<any>(R.prop(name))
		const ret = R.sortWith([sortingOpt], tbody)
		updateSortedData({
			header,
			body: ret,
		})
	}

	const handleClickClose = (e) => {
		onClickClose && onClickClose()
	}

	return (
		<Wrapper>
			{title && (
				<div className="title">
					<div className="texts">
						<span className="text">{title}</span>
						{subtext && <span className="subtext">{subtext}</span>}
					</div>
					<div className="buttons">
						{onClickClose && <button onClick={handleClickClose}>close</button>}
						<button onClick={handleExport}>export</button>
					</div>
				</div>
			)}
			<BarlineRange data={sortedData} isTimeseries={isTimeseries} />
			<div className="table-wrapper">
				<Table
					data={data}
					ref={tableRef}
					exportFilename={exportFilename}
					hasPaging
					onSorting={handleSorted}
				/>
			</div>
		</Wrapper>
	)
}

BarlineRangeTable.defaultProps = {
	title: 'Vehicle별',
	subtext: '',
	exportFilename: '반송량_vehicle별',
	data: {
		header: [],
		body: [],
	},
	onClick: () => {},
	onClickClose: null,
	isTimeseries: false,
}

interface Props {
	title?: string
	subtext?: string
	exportFilename?: string
	data?: {
		header: any[]
		body: any[]
	}
	onClick?: (values: any) => void
	onClickClose?: () => void
	isTimeseries?: boolean
}

export default BarlineRangeTable
