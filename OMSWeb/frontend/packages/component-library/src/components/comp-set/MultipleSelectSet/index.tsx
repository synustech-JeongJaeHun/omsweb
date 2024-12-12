/**
 *
 * MultipleSelectSet
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import { MultiSelect } from 'react-multi-select-component'
import { SketchPicker } from 'react-color'
import {
	isFullEmpty,
	isNotFullEmpty,
	isSameObjArr,
	convertR,
} from '@synusdev/shared'
import Checkbox from '../../form/Checkbox'
import { original, current } from 'immer'
import { useImmer } from 'use-immer'
import { Popover } from 'react-tiny-popover'
import { Wrapper, ColorChip } from './styled'
import { colorArr as legends, options as opt } from './exState'
import sectionList from './sectionList'

const emptySelection = {
	vehicle: [],
	sourceB: [],
	sourceS: [],
	destB: [],
	destS: [],
	point: [],
	alarm: [],
}

const defaultState = {
	currentColorId: 'id_mismatch',
	isApplyDisabled: true,
	showColorPicker: false,
	selection: emptySelection,
	legends,
}

const getTitle = (variant) => {
	switch (variant) {
		case 'normaltr':
			return 'Normal TR Report Condition'
		case 'abnormaltr':
			return 'Abnormal TR Report Condition'
		case 'alarm':
			return 'Alarm Report Condition'
		default:
			break
	}
}

const setLegends = (initialLegends) => {
	if (isFullEmpty(initialLegends)) {
		return legends
	}

	return initialLegends
}

const MultipleSelectSet: React.FC<Props> & any = ({
	variant,
	subtitle,
	onClose,
	onApply,
	labels,
	initialLegends,
	initialSelection,
}: Props) => {
	const ref = React.useRef()
	const safeLegend = setLegends(initialLegends)

	const {
		subfilterToSelection,
		selectionToSubfilter,
		subfilterToSubquery,
		options,
	} = convertR(variant, labels)
	const [state, updateState] = useImmer({
		...defaultState,
		legends: safeLegend,
		selection: subfilterToSelection(initialSelection),
	})

	const getSameLengend = (...arr) => {
		const asc = R.ascend(R.prop('id'))
		const ret = R.map(R.sortWith([asc]))(arr)
		return R.equals(...ret)
	}

	const handleChangeComplete = (color) => {
		const { currentColorId } = state

		updateState((draft) => {
			const index = R.findIndex(R.propEq('id', currentColorId), draft.legends)
			if (index !== -1) draft.legends[index].color = color.hex
			draft.isApplyDisabled = getSameLengend(safeLegend, current(draft.legends))
		})
	}

	const handleClickCover = () => {
		updateState((draft) => {
			draft.showColorPicker = false
		})
	}

	const handleClickColorchip = (id) => (e) => {
		updateState((draft) => {
			draft.currentColorId = id
			draft.showColorPicker = !draft.showColorPicker
		})
	}

	const renderSwatch = (id) => {
		const color = R.compose(
			R.prop('color'),
			R.find(R.propEq('id', id)),
		)(state.legends)
		return (
			<SketchPicker
				disableAlpha
				color={color}
				onChangeComplete={handleChangeComplete}
			/>
		)
	}

	const handleCheck = (id) => (value) => {
		updateState((draft) => {
			const index = R.findIndex(R.propEq('id', id), draft.legends)
			if (index !== -1) draft.legends[index].isChecked = value
			draft.isApplyDisabled = getSameLengend(safeLegend, current(draft.legends))
		})
	}

	const renderColorchips = () => {
		return state.legends.map((item, i) => {
			const { id, label, color, isChecked } = item
			return (
				<li key={i.toString()}>
					<div className="color-checker">
						<Checkbox
							name={id}
							label={label}
							checked={isChecked}
							onChange={handleCheck(id)}
						/>
						<Popover
							isOpen={state.currentColorId === id && state.showColorPicker}
							reposition={true}
							align="start"
							padding={5}
							positions={['bottom']} // preferred positions by priority
							onClickOutside={handleClickCover}
							containerStyle={{ zIndex: '10000' }}
							content={renderSwatch(id)}
						>
							<ColorChip color={color} onClick={handleClickColorchip(id)} />
						</Popover>
					</div>
				</li>
			)
		})
	}

	const handleChangeSelect = (section) => (ret) => {
		updateState((draft) => {
			draft.selection[section] = ret
			const currentSelection = current(draft.selection)
			const _initialSelection = subfilterToSelection(initialSelection)
			draft.isApplyDisabled = isSameObjArr(_initialSelection, currentSelection)
		})
	}

	const handleClickApply = () => {
		const selection = R.compose(
			subfilterToSubquery,
			selectionToSubfilter,
		)(state.selection)
		onApply && onApply({ selection, legends: state.legends })
	}

	const handleClickCancel = () => {
		onClose && onClose()
	}

	const renderContent = () => {
		const { showColorPicker, selectList } = sectionList[variant]

		return (
			<>
				{showColorPicker && (
					<div className="mss-color-pickers">
						<ul>{renderColorchips()}</ul>
					</div>
				)}
				<div className="mss-body">
					<div className="container">
						{selectList.map((item, i) => {
							let { label, section, option: optionKey, column, ref } = item
							const option = options[optionKey]

							if (isFullEmpty(option) || option.length === 0) {
								return []
							}

							if (isNotFullEmpty(ref)) {
								const refItem = R.find(R.propEq('section', ref), selectList)
								const refOption = options[refItem.option]

								if (
									isFullEmpty(refOption) ||
									(refOption && refOption.length === 0)
								) {
									column = item.altColumn
									label = item.altLabel
								}
							}

							return (
								<div
									key={i.toString()}
									className={`col ${column} has-select-wrapper`}
								>
									<h3>{label}</h3>
									<div className="select-wrapper">
										<MultiSelect
											options={option}
											hasSelectAll={true}
											isLoading={false}
											shouldToggleOnHover={false}
											disableSearch={false}
											value={state.selection[section]}
											disabled={false}
											onChange={handleChangeSelect(section)}
											onMenuToggle={(s) => {
												console.debug('Select Toggle: ', s)
											}}
											labelledBy={`Select ${label}`}
										/>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</>
		)
	}

	return (
		<Wrapper ref={ref}>
			<div className="mss-header">
				<h2>{getTitle(variant)}</h2>
				<p>{subtitle}</p>
			</div>
			{renderContent()}
			<div className="mss-footer">
				<button onClick={handleClickCancel}>Cancel</button>
				<button onClick={handleClickApply} disabled={state.isApplyDisabled}>
					Apply
				</button>
			</div>
		</Wrapper>
	)
}

MultipleSelectSet.defaultProps = {
	subtitle: 'Please select the items to include in the report results.',
	onClose: () => {},
	onApply: () => {},
	variant: 'alarm',
	labels: [],
	initialLegend: legends,
	initialSelection: emptySelection,
}
MultipleSelectSet.defaultState = defaultState

export interface Props {
	variant?: 'normaltr' | 'abnormaltr' | 'alarm'
	subtitle?: string
	onClose?: () => void
	onApply?: (value: any) => void
	labels?: any[]
	initialLegends?: {
		id: string
		label: string
		color: string
		isChecked: boolean
	}[]
	initialSelection?: {
		vehicle?: string[]
		sourceB?: string[]
		sourceS?: string[]
		destB?: string[]
		destS?: string[]
		point?: string[]
		alarm?: string[]
	}
}

export default MultipleSelectSet
