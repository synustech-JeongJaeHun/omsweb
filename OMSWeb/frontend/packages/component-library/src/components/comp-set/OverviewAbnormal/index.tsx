/**
 *
 * OverviewAbnormal
 *
 */

import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import { numberWithCommas, bdFormat } from '@daimre/shared'
import Container from '../../layout/Container'
import RCol from '../../layout/RCol'
import Col from '../../layout/Col'
import StackedBarTableV from '../../chart-set/StackedBarTableV'
import StackedBarTableH from '../../chart-set/StackedBarTableH'
import { Props as DatePickerProps } from '../../DatePicker'
import TitleSet from '../TitleSet'
import { exData, exEmptyData } from './exData'
import { QueryContext } from '../../../context'
import ContentPaneBody from '../../ContentPaneBody'
import Scrollable from '../../Scrollable'
import getConfig from './getConfig'

type StyleType = {}

const Wrapper = styled.div`
	padding-top: 30px;
	padding-left: 20px;
	padding-right: 20px;

	.chart-container {
		padding-top: 34px;
	}
`

const OverviewAbnormal: React.FC<Props> & any = ({
	stats,
	data,
	onDateChange,
	isStatPlaceholder,
	isChartPlaceholder,
	startDay,
	endDay,
}: Props) => {
	return (
		<ContentPaneBody>
			<Scrollable scroll="y" width="100%" height="100%">
				<Wrapper>
					<Container h="center">
						<RCol col={12} sm={12} md={12} lg={9}>
							<TitleSet
								title="Abnormal TR"
								isPlaceholder={isStatPlaceholder}
								stats={stats}
								startDay={startDay}
								endDay={endDay}
								onDateChange={onDateChange}
							/>
							<div className="chart-container">
								<Container gutter={20}>
									<RCol col={6} sm={12} md={6} lg={6}>
										<StackedBarTableV
											{...getConfig('duration', data.duration)}
											isPlaceholder={isChartPlaceholder}
										/>
									</RCol>
									<RCol col={6} sm={12} md={6} lg={6}>
										<Container bottomGutter={8}>
											<RCol col={12} sm={12} md={12} lg={12}>
												<StackedBarTableH
													{...getConfig('vehicle', data.vehicle)}
													isPlaceholder={isChartPlaceholder}
												/>
											</RCol>
											<RCol col={12} sm={12} md={12} lg={12}>
												<StackedBarTableH
													{...getConfig('source', data.source)}
													isPlaceholder={isChartPlaceholder}
												/>
											</RCol>
											<RCol col={12} sm={12} md={12} lg={12}>
												<StackedBarTableH
													{...getConfig('dest', data.dest)}
													isPlaceholder={isChartPlaceholder}
												/>
											</RCol>
										</Container>
									</RCol>
								</Container>
							</div>
							<div className="space"></div>
						</RCol>
					</Container>
				</Wrapper>
			</Scrollable>
		</ContentPaneBody>
	)
}

OverviewAbnormal.exData = exData
OverviewAbnormal.exEmptyData = exEmptyData

OverviewAbnormal.defaultProps = {
	stats: exEmptyData.stats,
	data: exEmptyData.data,
	isStatPlaceholder: false,
	isChartPlaceholder: false,
	startDay: bdFormat(1),
	endDay: bdFormat(0),
	onDateChange: (values) => {},
}

interface Props extends DatePickerProps {
	stats?: any
	data?: any
	isStatPlaceholder?: boolean
	isChartPlaceholder?: boolean
	onDateChange?: (any) => void
}

export default OverviewAbnormal
