/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
// @ts-nocheck
import React, { FC, useState, useEffect } from 'react'
import moment from 'moment'
import 'react-dates/initialize'
import { DateRangePicker } from 'react-dates'
import { beforeDay, afterDay, isNotFullEmpty } from '@daimre/shared'

const defaultStart = beforeDay(1).format('YYYY-MM-DD')
const defaultEnd = moment().format('YYYY-MM-DD')

const DatePicker: FC<Props> = ({
	startDay,
	endDay,
	onDateChangeCB,
	onFocusChangeCB,
	beforeRangeValue,
	beforeRangeUnit,
}: Props) => {
	const [startDate, setStartDate] = useState(moment(startDay))
	const [endDate, setEndDate] = useState(moment(endDay))
	const [focusedInput, setFocusedInput] = useState(null)

	useEffect(() => {
		setStartDate(moment(startDay))
	}, [startDay])

	const onDateChange = ({ startDate: start, endDate: end }) => {
    if (isNotFullEmpty(start) && isNotFullEmpty(end)) {
      setStartDate(start)
      setEndDate(end)
      onDateChangeCB && onDateChangeCB({ start, end })
    }
	}

	const onFocusChange = (input) => {
		setFocusedInput(input)
		onFocusChangeCB && onFocusChangeCB(input)
	}

	const isOutsideRange = (day) =>
		day.isAfter(moment()) ||
		day.isBefore(moment().subtract(beforeRangeValue, beforeRangeUnit))

	return (
		<DateRangePicker
			startDateId="startDate"
			endDateId="endDate"
			startDate={startDate}
			endDate={endDate}
			onDatesChange={onDateChange}
			focusedInput={focusedInput}
			onFocusChange={onFocusChange}
			minimumNights={0}
			// displayFormat='MM월 DD일'
			isOutsideRange={isOutsideRange}
			renderMonthElement={({ month: _moment }) => (
				<div>{_moment.format('MM.YYYY')}</div>
			)}
			renderDayContents={(day) => {
				day._locale._weekdaysMin = [
					'Sun',
					'Mon',
					'Tue',
					'Wed',
					'Thu',
					'Fri',
					'Sat',
				]
				return day.format('D')
			}}
		/>
	)
}

DatePicker.defaultProps = {
	startDay: defaultStart,
	endDay: defaultEnd,
	beforeRangeValue: 3,
	beforeRangeUnit: 'months',
}

export interface Props {
	startDay?: string
	endDay?: string

  selectDate?: string
	beforeRangeValue?: number
	beforeRangeUnit?: 'months' | 'days' | 'years'
	onDateChangeCB?: (data: any) => void
	onFocusChangeCB?: (data: any) => void
}

export default DatePicker
