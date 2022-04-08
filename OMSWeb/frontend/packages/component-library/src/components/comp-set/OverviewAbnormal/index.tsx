/**
 *
 * OverviewAbnormal
 *
 */

import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import { numberWithCommas } from '@daimre/shared'
import Container from '../../layout/Container'
import RCol from '../../layout/RCol'
import Col from '../../layout/Col'
import StackedBarTableV from '../../chart-set/StackedBarTableV'
import StackedBarTableH from '../../chart-set/StackedBarTableH'
import TitleSet from '../TitleSet'
import { exData, exEmptyData } from './exData'
import { QueryContext } from '../../../context'
import ContentPaneBody from '../../ContentPaneBody'
import Scrollable from '../../Scrollable'

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
	isPlaceholder
}: Props) => {

	return (
		<QueryContext.Provider value={{ isPlaceholder }}>
			<ContentPaneBody>
				<Scrollable
					scroll='y'
					width='100%'
					height='100%'
				>
					<Wrapper>
						<Container h='center'>
							<RCol col={12} sm={12} md={12} lg={9}>
								<TitleSet title="Abnormal TR" isPlaceholder={isPlaceholder} stats={stats} />
								<div className="chart-container">
									<Container gutter={20}>
										<RCol col={6} sm={12} md={6} lg={6}>
											<StackedBarTableV
												title="기간별"
												exportFilename="abnormaltr_기간별"
												data={data.duration}
												isPlaceholder={isPlaceholder}
											/>
										</RCol>
										<RCol col={6} sm={12} md={6} lg={6}>
											<Container bottomGutter={8}>
												<RCol col={12} sm={12} md={12} lg={12}>
													<StackedBarTableH
														title="Vehicle별"
														subtext="(TOP 6)"
														exportFilename="abnormaltr_vehicle별"
														limit={6}
														data={data.vehicle}
														isPlaceholder={isPlaceholder}
													/>
												</RCol>
												<RCol col={12} sm={12} md={12} lg={12}>
													<StackedBarTableH
														title="Source별"
														subtext="(TOP 6)"
														exportFilename="abnormaltr_source별"
														limit={6}
														data={data.source}
														isPlaceholder={isPlaceholder}
													/>
												</RCol>
												<RCol col={12} sm={12} md={12} lg={12}>
													<StackedBarTableH
														title="Dest별"
														subtext="(TOP 6)"
														exportFilename="abnormaltr_dest별"
														limit={6}
														data={data.dest}
														isPlaceholder={isPlaceholder}
													/>
												</RCol>
											</Container>
										</RCol>
									</Container>
								</div>
								<div className="space"></div>
							</RCol >
						</Container >
					</Wrapper>
				</Scrollable>
			</ContentPaneBody>
		</ QueryContext.Provider>
	)
}

OverviewAbnormal.exData = exData
OverviewAbnormal.exEmptyData = exEmptyData

OverviewAbnormal.defaultProps = {
	stats: exData.stats,
	data: exData.data,
	isPlaceholder: false
}

interface Props {
	stats?: any
	data?: any
	isPlaceholder?: boolean
}

export default OverviewAbnormal
