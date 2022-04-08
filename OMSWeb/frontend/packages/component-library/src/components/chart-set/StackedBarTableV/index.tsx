/**
 *
 * StackedBarTable
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import StackedBar from '../../charts/StackedBar'
import Table from '../../Table'
import { useEffectOnce, isFullEmpty } from '@daimre/shared'
import { QueryContext } from '../../../context'

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
		margin-top: 20px;
		height: 300px;
	}
`

const StackedBarTableV: React.FC<Props> = ({
	title,
	subtext,
	exportFilename,
	data,
	isPlaceholder
}: Props) => {
	const qc = React.useContext(QueryContext)
	const _isPlaceholder = qc.isPlaceholder || isPlaceholder
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
		const sortingOpt =
			value === 'asc'
				? R.ascend<any>(R.prop(name))
				: R.descend<any>(R.prop(name))
		const ret = R.sortWith([sortingOpt], tbody)
		updateSortedData({
			header,
			body: ret,
		})
	}

	const renderButtons = () => {
		const { body } = data

		if (isFullEmpty(body)) {
			return []
		}

		return (
			<div className="buttons">
				<button onClick={handleExport}>export</button>
			</div>
		)
	}

	return (
		<Wrapper>
			{title && (
				<div className="title">
					<div className="texts">
						<span className="text">{title}</span>
						{subtext && <span className="subtext">{subtext}</span>}
					</div>
					{renderButtons()}
				</div>
			)}
			<StackedBar data={sortedData} showLegend labelRotation={0} isPlaceholder={_isPlaceholder} />
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

StackedBarTableV.defaultProps = {
	title: 'Vehicle별',
	subtext: '',
	exportFilename: '반송량_vehicle별',
	data: {
		header: [],
		body: [],
	},
	isPlaceholder: false
}

interface Props {
	title?: string
	subtext?: string
	exportFilename?: string
	data?: {
		header: any[]
		body: any[]
	}
	isPlaceholder?: boolean
}

export default StackedBarTableV
