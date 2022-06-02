/**
 *
 * Overview
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import {
	numberWithCommas,
	genBaseline,
	numRound,
	convertEpochToStr,
} from '@daimre/shared'
import Container from '../../layout/Container'
import RCol from '../../layout/RCol'
import Col from '../../layout/Col'
import Donut from '../../charts/Donut'
import InfoTable from '../../InfoTable'
import SimpleStatBox from '../../SimpleStatBox'
import { exData, makeData } from './exData'
import { QueryContext } from '../../../context'
import ContentPaneBody from '../../ContentPaneBody'
import Scrollable from '../../Scrollable'

type StyleType = {}

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
	padding-left: 20px;
	padding-right: 20px;

	.title {
		font-size: 30px;
		line-height: 1;
		font-weight: bold;
		margin-top: 30px;
		margin-bottom: 64px;
	}

	.section-title {
		font-size: 16px;
		line-height: 1;
		padding-bottom: 12px;
		border-bottom: 1px solid #707070;
		margin-bottom: 30px;
	}

	.stat-list {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 35px;
	}
`
const avg = (arr = []) => {
	const { length } = arr
	return R.sum(arr) / length
}
const getAvg = R.compose(
	avg,
	R.map(R.prop(1)),
	R.reject(([a, b, isDummy]) => isDummy === 0),
)

const numRound2 = numRound(2, true)

const convertUtilValue = R.compose(numRound2, getAvg)
const convertDtValue = R.compose(convertEpochToStr, getAvg)

const Trend: React.FC<Props> & any = ({
	data,
	utilization,
	deliveryTime,
	isPlaceholder,
}: Props) => {
	const { stats, table, donuts } = data
	const { cpu, memory } = stats

	return (
		<QueryContext.Provider value={{ isPlaceholder }}>
			<ContentPaneBody>
				<Scrollable scroll="y" width="100%" height="100%">
					<Wrapper>
						<Container h="center">
							<RCol col={12} sm={12} md={12} lg={8}>
								<div className="title">Trend</div>
								<Container gutter={20}>
									<Col col={12}>
										<div className="section-title">Summary</div>
										<div className="stat-list">
											<SimpleStatBox
												title="Utilization(avg)"
												unit="%"
												value={convertUtilValue(utilization)}
											>
												<SimpleStatBox.InlineLineChart
													name="utilization"
													data={utilization}
													converter={(value) => `${value}%`}
												/>
											</SimpleStatBox>
											<SimpleStatBox
												title="Delivery Time(avg)"
												unit=""
												value={convertDtValue(deliveryTime)}
											>
												<SimpleStatBox.InlineLineChart
													name="delivery time"
													data={deliveryTime}
													converter={convertEpochToStr}
												/>
											</SimpleStatBox>
											<SimpleStatBox
												title="CPU"
												unit="%"
												value={cpu.usage}
												duration={cpu.model}
											/>
											<SimpleStatBox
												title="Memory"
												unit="%"
												value={numRound2(memory.usedPercent)}
											>
												<SimpleStatBox.DataList
													unit="GB"
													data={[
														{
															label: 'used',
															value: numRound2(memory.used / 1024),
														},
														{
															label: 'total',
															value: numRound2(memory.total / 1024),
														},
													]}
												/>
											</SimpleStatBox>
										</div>
										<InfoTable data={table} isPlaceholder={isPlaceholder} />
									</Col>
									<Col col={12}>
										<div className="section-title">Vehicle</div>
										<Container>
											{donuts.map((donut, i) => {
												return (
													<Col col={6} key={i.toString()}>
														<Donut data={donut} isPlaceholder={isPlaceholder} />
													</Col>
												)
											})}
										</Container>
									</Col>
								</Container>
								<div className="space"></div>
							</RCol>
						</Container>
					</Wrapper>
				</Scrollable>
			</ContentPaneBody>
		</QueryContext.Provider>
	)
}

Trend.defaultProps = {
	data: exData,
	isPlaceholder: false,
	utilization: genBaseline(),
	deliveryTime: genBaseline(),
}

Trend.exData = exData
Trend.makeData = makeData

interface Props {
	data?: any
	isPlaceholder?: boolean
	utilization?: any
	deliveryTime?: any
}

export default Trend
