import { numberWithCommas } from '@daimre/shared'
import {
	abnormaltrByVehicle,
	abnormaltrByDuration,
	abnormaltrByDest,
	abnormaltrBySource,
} from '../../../exData'

export const exData = {
	stats: [
		{
			variant: 'simple',
			data: {
				title: '총 실패량',
				value: '63',
				unit: '개',
			},
		},
		{
			variant: 'detail',
			data: {
				title: '기간별 평균 실패량',
				subLabel: '시간당',
				value: 0.04,
				unit: '개',
				details: [
					{
						label: '연간',
						value: numberWithCommas(63),
					},
					{
						label: '월별',
						value: numberWithCommas(15.75),
					},
					{
						label: '주간',
						value: numberWithCommas(3.93),
					},
					{
						label: '일별',
						value: numberWithCommas(1.01),
					},
				],
			},
		},
	],
	data: {
		duration: abnormaltrByDuration.body,
		vehicle: abnormaltrByVehicle.body,
		source: abnormaltrBySource.body,
		dest: abnormaltrByDest.body,
	},
}

export const exEmptyData = {
	stats: [
		{
			variant: 'simple',
			data: {
				value: '',
			},
		},
		{
			variant: 'detail',
			data: {
				value: '',
			},
		},
	],
	data: {
		duration: {
			header: [
				{
					caption: '기간',
					dataField: 'duration',
				},
				{
					caption: '실패량',
					dataField: 'failureAmount',
					width: 80,
				},
			],
			body: [],
		},
		vehicle: {
			header: [
				{
					caption: 'Vehicle명',
					dataField: 'vehicleName',
				},
				{
					caption: '실패량',
					dataField: 'failureAmount',
					width: 80,
				},
			],
			body: [],
		},
		source: {
			header: [
				{
					caption: 'Source명',
					dataField: 'sourceName',
				},
				{
					caption: '실패량',
					dataField: 'failureAmount',
					width: 80,
				},
			],
			body: [],
		},
		dest: {
			header: [
				{
					caption: 'Dest명',
					dataField: 'destName',
				},
				{
					caption: '실패량',
					dataField: 'failureAmount',
					width: 80,
				},
			],
			body: [],
		},
	},
}
