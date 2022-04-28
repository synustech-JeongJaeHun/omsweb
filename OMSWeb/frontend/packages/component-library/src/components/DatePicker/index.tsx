/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
// @ts-nocheck
import React, { FC, useState } from 'react'
import moment from 'moment'
import 'react-dates/initialize'
import { DateRangePicker } from 'react-dates'
import { beforeDay, afterDay } from '@daimre/shared'

const defaultStart = beforeDay(1).format('YYYY-MM-DD')
const defaultEnd = moment().format('YYYY-MM-DD')

const DatePicker: FC<Props> = ({
  startDay,
  endDay,
  onDateChangeCB,
  onFocusChangeCB,
	beforeRangeValue,
	beforeRangeUnit
}: Props) => {
  const [startDate, setStartDate] = useState(moment(startDay))
  const [endDate, setEndDate] = useState(moment(endDay))
  const [focusedInput, setFocusedInput] = useState(null)

  const onDateChange = ({ startDate: start, endDate: end }) => {
    setStartDate(start)
    setEndDate(end)
    onDateChangeCB && onDateChangeCB({ start, end })
  }

  const onFocusChange = (input) => {
    setFocusedInput(input)
    onFocusChangeCB && onFocusChangeCB(input)
  }

  const isOutsideRange = day =>
    day.isAfter(moment()) || day.isBefore(moment().subtract(beforeRangeValue, beforeRangeUnit));

  return (
    <DateRangePicker
      startDateId='startDate'
      endDateId='endDate'
      startDate={startDate}
      endDate={endDate}
      onDatesChange={onDateChange}
      focusedInput={focusedInput}
      onFocusChange={onFocusChange}
      displayFormat='MM월 DD일'
      isOutsideRange={isOutsideRange}
      renderMonthElement={({ month: _moment }) => (
        <div>{_moment.format('YYYY[년] MM[월]')}</div>
      )}
      renderDayContents={(day) => {
        day._locale._weekdaysMin = ['일', '월', '화', '수', '목', '금', '토']
        return day.format('D')
      }}
    />
  )
}

DatePicker.defaultProps = {
  startDay: defaultStart,
  endDay: defaultEnd,
	beforeRangeValue: 3,
	beforeRangeUnit: 'months'
}

export interface Props {
  startDay?: string
  endDay?: string
	beforeRangeValue?: number
	beforeRangeUnit?: 'months' | 'days' | 'years'
  onDateChangeCB?: (data: any) => void
  onFocusChangeCB?: (data: any) => void
}

export default DatePicker
