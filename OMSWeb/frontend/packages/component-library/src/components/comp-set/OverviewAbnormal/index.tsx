/**
 *
 * OverviewAbnormal
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@synusdev/styles'
import { numberWithCommas, bdFormat } from '@synusdev/shared'
import Container from '../../layout/Container'
import RCol from '../../layout/RCol'
import Col from '../../layout/Col'
import StackedBarTableV from '../../chart-set/StackedBarTableV'
import StackedBarTableH from '../../chart-set/StackedBarTableH'
import TitleSet, { Props as TitleSetProps } from '../TitleSet'
import { exData, exEmptyData } from './exData'
import { QueryContext } from '../../../context'
import ContentPaneBody from '../../ContentPaneBody'
import Scrollable from '../../Scrollable'
import getConfig from './getConfig'
import MultipleSelectSet from '../MultipleSelectSet'
import { isNotFullEmpty } from '@synusdev/shared'
import { useImmer } from 'use-immer'

type StyleType = {}

const Wrapper = styled.div`
	width: calc(100vw - 40px);
	height: calc(100vh - 30px);
	padding-top: 30px;
	padding-left: 20px;
	padding-right: 20px;

	.chart-container {
		padding-top: 34px;
	}
`

const getColors = (legends) => {
	return legends.reduce((acc, legend) => {
		const { id, color } = legend
		acc[id] = color
		return acc
	}, {})
}

const getDataKeys = R.compose(R.defaultTo([]), R.keys, R.omit(['label', 'failureamount']), R.head, R.prop('duration'))

const OverviewAbnormal: React.FC<Props> & any = ({
	stats,
	data,
	onDateChange,
	onClickConfig,
	isStatPlaceholder,
	isChartPlaceholder,
	startDay,
	endDay,
	colors,
}: Props) => {

  const [state, updateState] = useImmer({
    invisibledList: [],
    filteredList: data,
    dataKeys: getDataKeys(data)
  })

  const handleClickLengend = (legendData) => {
    const { invisibledList } = state
    const { name, visible } = legendData

    const addOrRemove = () => {
      if (visible) {
        return R.without([name], invisibledList)
      }
      return R.append(name, invisibledList)
    }

    updateState(draft => {
      draft.invisibledList = addOrRemove()
    })
  }

  const getFilteredList = React.useCallback((invisibledList) => {
    return R.map(
      R.map((item) => {
        const summedValue = R.compose(R.sum, R.values, R.pick(invisibledList))(item)
        const failureamount = Math.abs(item.failureamount - summedValue)
        const _item = { ...item, failureamount }
        return R.omit(invisibledList, _item)
      }),
      data,
    )
  }, [data])

  React.useEffect(() => {
    const { invisibledList } = state
    const dataKeys = getDataKeys(data)


    if (state.dataKeys.length !== dataKeys.length) {
      const diffKeys = R.difference(dataKeys, state.dataKeys)
      const filteredInvisibledList = R.without(diffKeys, invisibledList)

      updateState(draft => {
        draft.filteredList = getFilteredList(filteredInvisibledList)
        draft.dataKeys = dataKeys
        draft.invisibledList = filteredInvisibledList
      })
    } else {
      if (isNotFullEmpty(data)) {
        const list = getFilteredList(invisibledList)
        updateState(draft => {
          draft.filteredList = list
          draft.dataKeys = getDataKeys(data)
        })
      }
    }
  }, [data, state.invisibledList])

  const getDurationTableData = React.useCallback(() => {
    const { invisibledList } = state
    const {data: durationData} = getConfig('duration', data.duration)

    const body = R.map((item) => {
      const summedValue = R.compose(R.sum, R.values, R.pick(invisibledList))(item)
      const failureamount = Math.abs(item.failureamount - summedValue)
      const _item = { ...item, failureamount }
      return R.omit(invisibledList, _item)
    }, durationData.body)

    return { ...durationData, body }
  }, [data.duration, state.invisibledList])

  const { filteredList } = state

	return (
		<ContentPaneBody>
			<Scrollable scroll="y" width="100%" height="100%">
				<Wrapper>
					<Container h="center">
						<RCol col={12} sm={12} md={12} lg={9}>
							<TitleSet
								title="Abnormal TR"
								isPlaceholder={isStatPlaceholder}
								stats={stats}
								startDay={startDay}
								endDay={endDay}
								onDateChange={onDateChange}
								onClickConfig={onClickConfig}
							/>
							<div className="chart-container">
								<Container gutter={20}>
									<RCol col={6} sm={12} md={6} lg={6}>
										<StackedBarTableV
											{...getConfig('duration', data.duration)}
                      tableData={getDurationTableData()}
											isPlaceholder={isChartPlaceholder}
                      onClickLegend={handleClickLengend}
											colors={colors}
										/>
									</RCol>
									<RCol col={6} sm={12} md={6} lg={6}>
										<Container bottomGutter={8}>
											<RCol col={12} sm={12} md={12} lg={12}>
												<StackedBarTableH
													{...getConfig('vehicle', filteredList.vehicle)}
													isPlaceholder={isChartPlaceholder}
													colors={colors}
												/>
											</RCol>
											<RCol col={12} sm={12} md={12} lg={12}>
												<StackedBarTableH
													{...getConfig('source', filteredList.source)}
													isPlaceholder={isChartPlaceholder}
													colors={colors}
												/>
											</RCol>
											<RCol col={12} sm={12} md={12} lg={12}>
												<StackedBarTableH
													{...getConfig('dest', filteredList.dest)}
													isPlaceholder={isChartPlaceholder}
													colors={colors}
												/>
											</RCol>
										</Container>
									</RCol>
								</Container>
							</div>
							<div className="space"></div>
						</RCol>
					</Container>
				</Wrapper>
			</Scrollable>
		</ContentPaneBody>
	)
}

OverviewAbnormal.exData = exData
OverviewAbnormal.exEmptyData = exEmptyData

OverviewAbnormal.defaultProps = {
	stats: exEmptyData.stats,
	data: exEmptyData.data,
	isStatPlaceholder: false,
	isChartPlaceholder: false,
	startDay: bdFormat(1),
	endDay: bdFormat(0),
	onDateChange: (values) => {},
	onClickConfig: (values) => {},
	colors: getColors(MultipleSelectSet.defaultState.legends),
}

interface Props
	extends Pick<
		TitleSetProps,
		| 'startDay'
		| 'endDay'
		| 'onDateChange'
		| 'onClickConfig'
		| 'beforeRangeValue'
		| 'beforeRangeUnit'
	> {
	stats?: any
	data?: any
	isStatPlaceholder?: boolean
	isChartPlaceholder?: boolean
	onDateChange?: (any) => void
	colors?: string[]
}

export default OverviewAbnormal
