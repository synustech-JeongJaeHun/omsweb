// @ts-nocheck
import * as React from 'react'
import * as R from 'ramda'
import {
	isFullEmpty,
	isNotFullEmpty,
	bdFormat,
	convertDurationLabel,
	isType,
	ls,
} from '@daimre/shared'
import styled from '@emotion/styled'
import { useQuery } from 'react-query'
import { TitleBarlineSet } from '@daimre/component-library'
import { getAgt } from '../../utils'
import da from './dataAdapter'
import { useImmer } from 'use-immer'
import * as df from 'date-fns/fp'
import { ModalFilter } from '../../components'

const Wrapper = styled.div`
	height: 100%;
`

const variant = 'alarm'

const placeholderData = TitleBarlineSet.exEmptyData[variant]
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

const Alarm = () => {
	const compRef = React.useRef(null)
	const modalRef = React.useRef(null)
	const [labels, setLabels] = React.useState({})
	const savedValues = getLsValues('alarm')
	const [state, updateState] = useImmer({
		layoutKey: 'overview',
		layoutValue: '',
		startStr: bdFormat(7),
		endStr: bdFormat(0),
		beforeRangeValue: 3,
		...savedValues,
	})

	const { data: dic } = useQuery(
		[variant, 'labels'],
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

	const { data: stats, isFetching: isStatLoading } = useQuery(
		[variant, 'stats', state['subfilter']],
		async () => {
			const ret = await agt.stats({ variant, subfilter: state['subfilter'] })
			return da.stats(ret.data)
		},
		{
			placeholderData: placeholderData.stats,
			// refetchInterval: 10000
		},
	)

	useQuery(
		['abnormaltr', 'appsettings'],
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

	const { data: chartData, isFetching: isChartLoading } = useQuery(
		[
			variant,
			'charts',
			state['startStr'],
			state['endStr'],
			state['layoutKey'],
			state['layoutValue'],
			state['subfilter'],
		],
		async () => {
			const { layoutKey, layoutValue, startStr, endStr, subfilter } = state
			const ret = await agt.charts({
				variant,
				section: layoutKey,
				selected_item: layoutValue,
				start: startStr,
				end: endStr,
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
		const strList = R.map(
			R.map((item) => {
				const _type = isType(item)
				switch (_type) {
					case 'number':
						return R.toString(item)
					default:
						return item
				}
			}),
			selection,
		)
		updateState((draft) => {
			draft.initialFilter = strList
			draft.subfilter = selection
		})

		ls.set('alarm_selection', selection)
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
				onClickConfig={handleClickConfig}
				isStatPlaceholder={isStatLoading}
				isChartPlaceholder={isChartLoading}
				beforeRangeValue={state['beforeRangeValue']}
				beforeRangeUnit="months"
			/>
			<ModalFilter
				ref={modalRef}
				variant="alarm"
				labels={labels}
				initialSelection={state.initialFilter}
				onApply={handleApply}
			/>
		</Wrapper>
	)
}

export default Alarm
