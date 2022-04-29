// @ts-nocheck
import * as React from 'react'
import * as R from 'ramda'
import { isFullEmpty, bdFormat, convertDurationLabel } from '@daimre/shared'
import styled from '@emotion/styled'
import { useQuery } from 'react-query'
import { TitleBarlineSet } from '@daimre/component-library'
import { getAgt } from '../../utils'
import da from './dataAdapter'
import { useImmer } from 'use-immer'
import * as df from 'date-fns/fp'


const Wrapper = styled.div`
  height: 100%;
`

const variant = 'alarm'

const placeholderData = TitleBarlineSet.exEmptyData[variant]
const agt = getAgt()
const dateformyyyy = df.format('yyyy')

const Alarm = () => {
  const compRef = React.useRef(null)
  const [state, updateState] = useImmer({
    layoutKey: 'overview',
    layoutValue: '',
    startStr: bdFormat(1),
    endStr: bdFormat(0)
  })

  const { data: dic } = useQuery([variant, 'labels'], async () => {
    const ret = await agt.labels()
    const temp = ret.data
    return temp.reduce((acc, item) => {
      const { id, label } = item
      acc[label] = id
      return acc
    }, {})
  }, {
    placeholderData: {}
  })

  const { data: stats, isFetching: isStatLoading } = useQuery(
    [variant, 'stats'],
    async () => {
      const ret = await agt.stats({ variant })
      return da.stats(ret.data)
  }, {
    placeholderData: placeholderData.stats,
    // refetchInterval: 10000
  })

  const { data: chartData, isFetching: isChartLoading } = useQuery(
    [
      variant, 'charts',
      state['startStr'], state['endStr'],
      state['layoutKey'], state['layoutValue']
    ],
    async () => {
      const { layoutKey, layoutValue, startStr, endStr } = state
      const ret = await agt.charts({
        variant,
        section: layoutKey,
        selected_item: layoutValue,
        start: startStr,
        end: endStr
      })
      return da.charts(ret.data)
    },
    {
      placeholderData: placeholderData.data,
      // refetchInterval: 10000
    }
  )

  const handleClickItem = React.useCallback(({ key, value }) => {
    const startDate = new Date(state['startStr'])
    const year = dateformyyyy(startDate)
    const _value = key === 'duration' ? convertDurationLabel(value, year) : dic[value]
    updateState((draft) => {
      draft.layoutKey = key
      draft.layoutValue = _value
    })
  }, [dic])


  const handleDateChange = ({ start, end }) => {
    const startStr = start.format('YYYY-MM-DD')
    const endStr = end.format('YYYY-MM-DD')

    updateState((draft) => {
      draft.layoutKey = 'overview'
      draft.layoutValue = ''
      draft.startStr = startStr
      draft.endStr = endStr
    })
    if (compRef.current !== null) {
      compRef.current.reset()
    }
  }

	return (
		<Wrapper>
			<TitleBarlineSet
        ref={compRef}
        pageVariant={variant}
        startDay={state['startStr']}
        endDay={state['endStr']}
        stats={stats}
        data={chartData}
        onClickItem={handleClickItem}
        onDateChange={handleDateChange}
        isStatPlaceholder={isStatLoading}
        isChartPlaceholder={isChartLoading}
        beforeRangeValue={3}
        beforeRangeUnit='months' />
		</Wrapper>
	)
}

export default Alarm
