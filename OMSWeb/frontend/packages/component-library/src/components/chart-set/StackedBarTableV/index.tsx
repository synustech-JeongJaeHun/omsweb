/**
 *
 * StackedBarTable
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@synusdev/styles'
import StackedBar from '../../charts/StackedBar'
import Table from '../../Table'
import { useEffectOnce, isFullEmpty } from '@synusdev/shared'
import { QueryContext } from '../../../context'
import { getSortedValues } from '../../../utils'
import { useImmer } from 'use-immer'

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
  tableData,
	isPlaceholder,
	colors,
  onClickLegend,
}: Props) => {
	const qc = React.useContext(QueryContext)
	const _isPlaceholder = qc.isPlaceholder || isPlaceholder
  const [state, updateState] = useImmer({
    sortedData: data,
    sortingOpt: null
  })
	const tableRef: any = React.useRef(null)

	useEffectOnce(() => {
    const { sortingOpt } = state
    if (sortingOpt === null) {
      updateState(draft => {
        draft.sortedData = data
      })
    } else {
      const sortedValues = getSortedValues(sortingOpt, data)
      updateState(draft => {
        draft.sortedData = sortedValues
      })
    }

	}, [data, state.sortingOpt])

	const handleExport = (e) => {
		if (tableRef.current) {
			tableRef.current.instance.exportToExcel(false)
		}
	}

	const handleSorted = (sortedOpt) => {
    const sortedValues = getSortedValues(sortedOpt, data)
    updateState(draft => {
      draft.sortedData = sortedValues
      draft.sortingOpt = sortedOpt
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

  const handleClickLegend= (legendData) => {
    onClickLegend && onClickLegend(legendData)
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
			<StackedBar
				data={state.sortedData}
				showLegend
				labelRotation={0}
				isPlaceholder={_isPlaceholder}
				colors={colors}
        onClickLegend={handleClickLegend}
			/>
			<div className="table-wrapper">
				<Table
					data={tableData}
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
  tableData: {
		header: [],
		body: [],
	},
	isPlaceholder: false,
  onClickLegend: () => {},
}

interface Props {
	title?: string
	subtext?: string
	exportFilename?: string
	data?: {
		header: any[]
		body: any[]
	}
  tableData?: {
		header: any[]
		body: any[]
	}
	isPlaceholder?: boolean
	colors?: any
  onClickLegend?: (legendData: any) => void
}

export default StackedBarTableV
