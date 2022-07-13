// @ts-nocheck
import * as React from 'react'
import * as R from 'ramda'
import {
	bdFormat,
	isFullEmpty,
	isNotFullEmpty,
	isType,
	ls,
} from '@daimre/shared'
import styled from '@emotion/styled'
import * as Modal from 'react-modal'
import { useQuery } from 'react-query'
import {
	OverviewAbnormal,
	MultipleSelectSet,
	Icon,
	Button,
} from '@daimre/component-library'
import { getAgt } from '../../utils'
import { ModalFilter } from '../../components'
import { useImmer } from 'use-immer'
import da from './dataAdapter'

const Wrapper = styled.div`
	height: 100%;
`
const placeholderData = OverviewAbnormal.exEmptyData
const exData = OverviewAbnormal.exData
const agt = getAgt()
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
const getColors = (objArr) => {
	return objArr.reduce((acc, item) => {
		const { id, color } = item
		acc[id] = color
		return acc
	}, {})
}
const getBlacklistIds = R.compose(
	R.pluck('id'),
	R.filter(R.propEq('isChecked', false)),
)
const getLsValues = (variant) => {
	const [selection, legends] = R.compose(
		R.map(JSON.parse),
		ls.getList,
	)([`${variant}_selection`, `${variant}_legends`])
	return {
		initialFilter: isNotFullEmpty(selection) ? setStrList(selection) : null,
		subfilter: isNotFullEmpty(selection) ? selection : null,
		initialLegends: isNotFullEmpty(legends) ? legends : null,
		colors: isNotFullEmpty(legends)
			? getColors(legends)
			: getColors(MultipleSelectSet.defaultState.legends),
		blacklistIds: isNotFullEmpty(legends) ? getBlacklistIds(legends) : [],
	}
}

const defaultChartData = {
	duration: [],
	vehicle: [],
	source: [],
	dest: [],
}

const Abnormaltr = () => {
	const modalRef = React.useRef(null)
	const [labels, setLabels] = React.useState({})
	const savedValues = getLsValues('abnormaltr')
	const [state, updateState] = useImmer({
		initialChartData: defaultChartData,
		startStr: bdFormat(7),
		endStr: bdFormat(0),
		...savedValues,
	})

	useQuery(
		['abnormaltr', 'labels'],
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
		['abnormaltr', 'stats', state['subfilter'], state['blacklistIds']],
		async () => {
			const ret = await agt.stats({
				variant: 'abnormaltr',
				subfilter: state['subfilter'],
				blacklistIds: state['blacklistIds'],
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
			'abnormaltr',
			'charts',
			state['startStr'],
			state['endStr'],
			state['subfilter'],
		],
		async () => {
			const { startStr, endStr, subfilter } = state
			const ret = await agt.charts({
				variant: 'abnormaltr',
				section: 'overview',
				selected_item: '',
				start: startStr,
				end: endStr,
				subfilter,
			})
			const _chartData = ret.data

			updateState((draft) => {
				draft.initialChartData = _chartData
			})
			return _chartData
		},
		{
			placeholderData: placeholderData.data,
			// refetchInterval: 10000
		},
	)

	const filteredChartData = React.useCallback(() => {
		const _chartData = state['initialChartData']
		const initialLegends = R.defaultTo([])(state['initialLegends'])
		const blacklist = R.compose(
			R.pluck('id'),
			R.filter(R.propEq('isChecked', false)),
		)(initialLegends)
		const ret = R.map(
			R.map((item) => {
				const summedValue = R.compose(R.sum, R.values, R.pick(blacklist))(item)
				const failureamount = Math.abs(item.failureamount - summedValue)
				const _item = { ...item, failureamount }
				return R.omit(blacklist, _item)
			}),
			_chartData,
		)

		return ret
	}, [chartData, state])

	const handleDateChange = ({ start, end }) => {
		const startStr = start.format('YYYY-MM-DD')
		const endStr = end.format('YYYY-MM-DD')

		updateState((draft) => {
			draft.startStr = startStr
			draft.endStr = endStr
		})
	}

	const handleClickConfig = () => {
		if (modalRef.current) {
			modalRef.current.openModal()
		}
	}

	const handleApply = ({ selection, legends }) => {
		updateState((draft) => {
			draft.initialFilter = setStrList(selection)
			draft.initialLegends = legends
			draft.subfilter = selection
			draft.colors = getColors(legends)
			draft.blacklistIds = getBlacklistIds(legends)
		})
		ls.setObj({
			abnormaltr_selection: selection,
			abnormaltr_legends: legends,
		})
	}

	return (
		<>
			<OverviewAbnormal
				stats={stats}
				data={filteredChartData()}
				isStatPlaceholder={isStatLoading}
				isChartPlaceholder={isChartLoading}
				startDay={state['startStr']}
				endDay={state['endStr']}
				onDateChange={handleDateChange}
				onClickConfig={handleClickConfig}
				colors={state.colors}
			/>
			<ModalFilter
				ref={modalRef}
				variant="abnormaltr"
				labels={labels}
				initialLegends={state.initialLegends}
				initialSelection={state.initialFilter}
				onApply={handleApply}
			/>
		</>
	)
}

export default Abnormaltr
