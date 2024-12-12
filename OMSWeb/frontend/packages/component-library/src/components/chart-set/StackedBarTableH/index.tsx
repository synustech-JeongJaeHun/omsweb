/**
 *
 * StackedBarTableH
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@synusdev/styles'
import StackedBar from '../../charts/StackedBar'
import Table from '../../Table'
import Container from '../../layout/Container'
import Col from '../../layout/Col'
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

const StackedBarTableH: React.FC<Props> = ({
	title,
	subtext,
	exportFilename,
	limit,
	data,
	isPlaceholder,
	colors,
}: Props) => {
	const qc = React.useContext(QueryContext)
	const _isPlaceholder = qc.isPlaceholder || isPlaceholder
  const [state, updateState] = useImmer({
    sortedData: data,
    sortingOpt: {
      name: 'failureamount',
      value: 'desc'
    }
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

  // const handleClickLegend= (legendData) => {
  //   console.log('legendData', legendData)
  // }


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
					<StackedBar
						height={266}
						limit={limit}
						data={state.sortedData}
						isPlaceholder={_isPlaceholder}
						colors={colors}
            // onClickLegend={handleClickLegend}
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

StackedBarTableH.defaultProps = {
	title: 'Vehicle별',
	subtext: '(TOP 6)',
	exportFilename: '반송량_vehicle별',
	limit: null,
	data: {
		header: [],
		body: [],
	},
	isPlaceholder: false,
}

interface Props {
	title?: string
	subtext?: string
	exportFilename?: string
	limit?: number | null
	data?: {
		header: any[]
		body: any[]
	}
	isPlaceholder?: boolean
	colors?: any
}

export default StackedBarTableH
