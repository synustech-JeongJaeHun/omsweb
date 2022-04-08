import { css } from '@emotion/react'
import { color } from '../constants'

const resetDates = css`
	.DateRangePicker {
		z-index: 5;
	}

	.DateInput,
	.DateRangePickerInput {
		background: ${color.bg};
	}

	.DateInput {
		width: 100px;
	}

	.DateInput_input {
		background-color: ${color.bg};
		color: ${color.text};
		font-size: 12px;
		padding: 4px 0 2px 11px;
		border-bottom: 1px solid transparent;

		&__focused {
			border-bottom: 1px solid ${color.text};
		}
	}

	.DateRangePickerInput_arrow {
		color: rgba(0, 0, 0, 0.5);
		width: 24px;
		transform: scale(0.7);
	}

	.DateRangePickerInput__withBorder {
		border-color: ${color.line};
	}

	.DateRangePicker_picker {
		background-color: ${color.bg};
	}

	.DayPickerNavigation_button__default {
		border-color: ${color.line};
	}

	.CalendarMonth,
	.CalendarDay__default,
	.DayPicker__horizontal,
	.DateInput_fang,
	.CalendarMonthGrid,
	.DayPickerNavigation_button__default {
		background-color: ${color.bg};
		color: ${color.text};
	}

	.CalendarDay__default {
		border-color: ${color.line};

		&:hover {
			background: rgba(255, 255, 255, 0.1);
			border: 1px solid ${color.line};
			color: inherit;
		}
	}

	.CalendarDay__blocked_out_of_range {
		color: rgba(0, 0, 0, 0.3);

		&:hover {
			color: rgba(0, 0, 0, 0.3);
		}
	}

	.CalendarDay__selected,
	.CalendarDay__selected:active,
	.CalendarDay__selected:hover {
		background: rgba(0, 0, 0, 0.5);
		border: 1px double ${color.line};
		color: white;
	}

	.CalendarDay__selected_span {
		background: rgba(0, 0, 0, 0.05);
		border: 1px double ${color.line};
	}

	.CalendarDay__selected_span:active,
	.CalendarDay__selected_span:hover {
		background: rgba(0, 0, 0, 0.2);
		border: 1px double ${color.line};
		color: white;
	}

	.CalendarMonth_caption {
		color: ${color.text};
		font-size: 14px;
		font-weight: bold;
	}

	.DayPicker_weekHeader {
		color: ${color.text};
		font-size: 12px;
		top: 55px;
	}

	.DayPickerKeyboardShortcuts_show__bottomRight {
		display: none;
	}

	.DateInput_fangStroke {
		stroke: ${color.line};
		fill: ${color.bg};
	}

	.DateInput_fangShape {
		fill: ${color.bg};
	}

	.DayPicker {
		/* border: 1px solid ${color.line}; */
	}

	.DateRangePicker_picker {
		border: 1px solid ${color.line};
		margin-top: -19px;
	}

	.DateInput_fang.DateInput_fang_1 {
		margin-top: -18px;
	}
`

export default resetDates
