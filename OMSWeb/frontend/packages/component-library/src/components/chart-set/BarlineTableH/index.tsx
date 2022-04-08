/**
 *
 * BarlineTable
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import Barline from '../../charts/Barline'
import Table from '../../Table'
import Container from '../../layout/Container'
import Col from '../../layout/Col'
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
		margin-bottom: 20px;

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

const BarlineTableH: React.FC<Props> = ({
	title,
	subtext,
	exportFilename,
	limit,
	data,
	onClick,
	onZoom,
	variant,
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
			body: R.clone(ret),
		})
	}

	const handleZoom = (e) => {
		onZoom && onZoom({ variant, data })
	}

	const renderButtons = () => {
		const { body } = data

		if (isFullEmpty(body)) {
			return []
		}

		return (
			<div className="buttons">
				{onZoom && <button onClick={handleZoom}>zoom</button>}
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
			<Container gutter={5}>
				<Col col={6}>
					<Barline
						height={266}
						isH
						limit={limit}
						data={sortedData}
						onClick={onClick}
						variant={variant}
						isPlaceholder={_isPlaceholder}
					/>
				</Col>
				<Col col={6}>
					<div className="table-wrapper">
						<Table
							ref={tableRef}
							height={194}
							exportFilename={exportFilename}
							data={data}
							onSorting={handleSorted}
						/>
					</div>
				</Col>
			</Container>
		</Wrapper>
	)
}

BarlineTableH.defaultProps = {
	title: 'Vehicle별',
	subtext: '(TOP 6)',
	exportFilename: '반송량_vehicle별',
	limit: null,
	data: {
		header: [],
		body: [],
	},
	onClick: () => {},
	onZoom: null,
	variant: '',
	isPlaceholder: false
}

interface Props {
	variant?: string
	title?: string
	subtext?: string
	exportFilename?: string
	limit?: number | null
	data?: {
		header: any[]
		body: any[]
	}
	onClick?: (values: any) => void
	onZoom?: (value: any) => void
	isPlaceholder?: boolean
}

export default BarlineTableH
