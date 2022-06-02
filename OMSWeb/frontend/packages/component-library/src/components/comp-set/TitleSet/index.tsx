/**
 *
 * TitleSet
 *
 */

import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import { numberWithCommas, isFullEmpty, isNotFullEmpty, bdFormat } from '@daimre/shared'
import DatePicker, { Props as DatePickerProps }  from '../../DatePicker'
import SimpleStatBox from '../../SimpleStatBox'
import DetailStatBox from '../../DetailStatBox'
import { QueryContext } from '../../../context'
import RCol from '../../layout/RCol'
import Container from '../../layout/Container'
import ContentPaneBody from '../../ContentPaneBody'
import { calcBreakpoint } from '@daimre/shared'

type StyleType = {}

const Wrapper = styled.div`
	// display: flex;
	// justify-content: space-between;
	// margin-bottom: 54px;

	.title-area {
		.top {
			display: flex;
			align-items: flex-start;

			.title {
				font-size: 30px;
				font-weight: bold;
				margin-right: 27px;
			}

			.picker-wrapper {
				margin-top: 4px;
			}
		}
		.bottom {
			button {
				background: none;
				border: none;
				font-size: 18px;
			}
		}
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
	}
`
const PaneBodyContext = ContentPaneBody.PaneBodyContext

const TitleSet: React.FC<Props> = ({
	title,
	subtitle,
	stats,
	onClick,
	isPlaceholder,
	onDateChange,
	startDay,
	endDay,
	beforeRangeValue,
	beforeRangeUnit
}: Props) => {
	const { width } = React.useContext(PaneBodyContext)
	const breakpoint = calcBreakpoint(width)
	const hAlign = breakpoint === 'lg' || breakpoint === 'md' ? 'right': 'left'

	return (
		<Wrapper>
			<Container>
				<RCol col={4} sm={12} md={4} lg={4}>
					<div className="title-area">
						<div className="top">
							<div className="title">
								<span className="text">{title}</span>
							</div>
							<div className="picker-wrapper">
								<DatePicker
									startDay={startDay}
									endDay={endDay}
									beforeRangeValue={beforeRangeValue}
									beforeRangeUnit={beforeRangeUnit}
									onDateChangeCB={onDateChange} />
							</div>
						</div>
						<div className="bottom">
							{isNotFullEmpty(subtitle) && (
								<button onClick={onClick}>&lt;&nbsp;&nbsp;{subtitle}</button>
							)}
						</div>
					</div>
				</RCol>
				<RCol col={8} sm={12} md={8} lg={8} >
					<Container h={hAlign}>
						<div className="stats">
							{stats.map((item, i) => {
								const { variant, data } = item
								switch (variant) {
									case 'simple':
										return (
											<div key={i.toString()}>
												<SimpleStatBox isPlaceholder={isPlaceholder} duration="" {...data} />
											</div>
										)
									default:
										return (
											<div key={i.toString()}>
												<DetailStatBox isPlaceholder={isPlaceholder} {...data} />
											</div>
										)
								}
							})}
						</div>
					</Container>
				</RCol>
			</Container>
		</Wrapper>
	)
}

TitleSet.defaultProps = {
	title: 'Normal TR',
	subtitle: '',
	stats: [],
	onClick: () => {},
	isPlaceholder: false,
	onDateChange: (value) => {},
	startDay: bdFormat(1),
	endDay: bdFormat(0),
	beforeRangeValue: 3,
	beforeRangeUnit: 'months'
}

export interface Props extends DatePickerProps {
	title: string
	subtitle?: string
	stats?: any
	onClick?: (e: any) => void
	isPlaceholder?: boolean
	onDateChange?: (any) => void
}

export default TitleSet
