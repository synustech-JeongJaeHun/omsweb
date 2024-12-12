// @ts-nocheck
import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { useQuery } from 'react-query'
import * as df from 'date-fns/fp'
import {
	isFullEmpty,
	isNotFullEmpty,
	bdFormat,
	convertDurationLabel,
	isType,
	ls,
} from '@synusdev/shared'
import { TitleBarlineSet } from '@synusdev/component-library'
import { getAgt } from '../../utils'
import da from './dataAdapter'
import { useImmer } from 'use-immer'
import { ModalFilter } from '../../components'

const Wrapper = styled.div`
	height: 100%;
`

const placeholderData = TitleBarlineSet.exEmptyData.normaltr
const agt = getAgt()
const dateformyyyy = df.format('yyyy')
const setStrList = R.map(
	R.map((item) => {
		const _type = isType(item)
		switch (_type) {
			case 'number':
				return R.toString(item)
			default:
				return item
		}
	}),
)

const getLsValues = (variant) => {
	const ret = ls.get(`${variant}_selection`)
	if (isFullEmpty(ret)) {
		return {
			initialFilter: null,
			subfilter: null,
		}
	}
	return {
		initialFilter: setStrList(ret),
		subfilter: ret,
	}
}

const NormalTr: React.FC = () => {
	const compRef = React.useRef(null)
	const modalRef = React.useRef(null)
	const [labels, setLabels] = React.useState([])
	const savedValues = getLsValues('normaltr')
	const [state, updateState] = useImmer({
		layoutKey: 'overview',
		layoutValue: '',
		startStr: bdFormat(7),
		endStr: bdFormat(0),
    select: bdFormat(0),
		beforeRangeValue: 3,
		...savedValues,
	})

	const { data: dic } = useQuery(
		['normaltr', 'labels'],
		async () => {
			const ret = await agt.labels()
			const temp = ret.data
			setLabels(temp)
			return temp.reduce((acc, item) => {
				const { id, label } = item
				acc[label] = id
				return acc
			}, {})
		},
		{
			placeholderData: {},
		},
	)

	useQuery(
		['normaltr', 'appsettings'],
		async () => {
			const ret = await agt.appsettings()
			const temp = ret.data
			const report = R.path(['AppSettings', 'Report'], temp)
			if (isNotFullEmpty(report)) {
				const { BeforeMonthRangeValue, BeforeDayRangeValue } = report
				updateState((draft) => {
					draft['startStr'] = bdFormat(BeforeDayRangeValue)
					draft['beforeRangeValue'] = BeforeMonthRangeValue
				})
			}
			return temp
		},
		{
			placeholderData: {},
		},
	)

	const { data: stats, isFetching: isStatLoading } = useQuery(
		[
			'normaltr',
			'stats',
			state['startStr'],
			state['endStr'],
			state['subfilter'],
		],
		async () => {
			const ret = await agt.stats({
				variant: 'normaltr',
				start: state['startStr'],
				end: state['endStr'],
				subfilter: state['subfilter'],
			})
			return da.stats(ret.data)
		},
		{
			placeholderData: placeholderData.stats,
			// refetchInterval: 10000
		},
	)

	const { data: chartData, isFetching: isChartLoading } = useQuery(
		[
			'normaltr',
			'charts',
			state['startStr'],
			state['endStr'],
			state['layoutKey'],
			state['layoutValue'],
			state['subfilter'],
      state['select']
		],
		async () => {
			const { layoutKey, layoutValue, startStr, endStr, subfilter, select } = state
			const ret = await agt.charts({
				variant: 'normaltr',
				section: layoutKey,
				selected_item: layoutValue,
				start: startStr,
				end: endStr,
        select: select,
				subfilter,
			})
			return da.charts(ret.data)
		},
		{
			placeholderData: placeholderData.data,
			// refetchInterval: 10000
		},
	)

	const handleClickItem = React.useCallback(
		({ key, value }) => {
			const startDate = new Date(state['startStr'])
			const year = dateformyyyy(startDate)
			const _value =
				key === 'duration' ? convertDurationLabel(value, year) : dic[value]
			updateState((draft) => {
				draft.layoutKey = key
				draft.layoutValue = _value
			})
		},
		[dic],
	)

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

	const handleClickConfig = () => {
		if (modalRef.current) {
			modalRef.current.openModal()
		}
	}

	const handleApply = ({ selection }) => {
		updateState((draft) => {
			draft.initialFilter = setStrList(selection)
			draft.subfilter = selection
		})
		ls.set('normaltr_selection', selection)
	}

	return (
		<Wrapper>
			<TitleBarlineSet
				ref={compRef}
				pageVariant="normaltr"
				startDay={state['startStr']}
				endDay={state['endStr']}
        selectDate={state['select']}
				stats={stats}
				data={chartData}
				onClickItem={handleClickItem}
				onDateChange={handleDateChange}
				onClickConfig={handleClickConfig}
				isStatPlaceholder={isStatLoading}
				isChartPlaceholder={isChartLoading}
				beforeRangeValue={state['beforeRangeValue']}
				beforeRangeUnit="months"
			/>
			<ModalFilter
				ref={modalRef}
				variant="normaltr"
				labels={labels}
				initialSelection={state.initialFilter}
				onApply={handleApply}
			/>
		</Wrapper>
	)
}

export default NormalTr
