/**
 *
 * Overview
 *
 */

import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import { numberWithCommas, genBaseline } from '@daimre/shared'
import Container from '../../layout/Container'
import RCol from '../../layout/RCol'
import Col from '../../layout/Col'
import Donut from '../../charts/Donut'
import InfoTable from '../../InfoTable'
import SimpleStatBox from '../../SimpleStatBox'
import { exData } from './exData'
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

const Trend: React.FC<Props> & any = ({ data, isPlaceholder }: Props) => {
	const { stats, table, donuts } = data

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
							<RCol col={12} sm={12} md={12} lg={8}>
								<div className="title">Trend</div>
								<Container gutter={20}>
									<Col col={12}>
										<div className="section-title">Summary</div>
										<div className="stat-list">
											<SimpleStatBox
												title="Utilization"
												unit="%"
												value="67.78"
											>
												<SimpleStatBox.InlineLineChart data={[
													{
														name: 'Utilization',
														data: genBaseline(),
													},
												]} />
											</SimpleStatBox>
											<SimpleStatBox
												title="Delivery Time"
												unit="sec"
												value="87.10"
											>
												<SimpleStatBox.InlineLineChart data={[
													{
														name: 'Delivery Time',
														data: genBaseline(),
													},
												]} />
											</SimpleStatBox>
											<SimpleStatBox
												title="CPU"
												unit="%"
												value="18"
												duration='3.84GHz'

											/>
											<SimpleStatBox
												title="Memory"
												unit="%"
												value="50"
											>
												<SimpleStatBox.DataList unit='GB' data={[
													{
														label: 'use',
														value: 7.9
													},
													{
														label: 'total',
														value: 15.8
													}
												]} />
											</SimpleStatBox>
										</div>
										<InfoTable data={table} isPlaceholder={isPlaceholder} />
									</Col>
									<Col col={12}>
										<div className="section-title">Vehicle</div>
										<Container>
											{
												donuts.map((donut, i) => {
													return (
														<Col col={6} key={i.toString()}>
															<Donut
																data={donut}
																isPlaceholder={isPlaceholder}
															/>
														</Col>
													)
												})
											}
										</Container>
									</Col>
								</Container>
								<div className="space"></div>
							</RCol >
						</Container >
					</Wrapper>
				</Scrollable>
			</ContentPaneBody>
		</ QueryContext.Provider>
	)
}

Trend.defaultProps = {
	data: exData,
	isPlaceholder: false
}

Trend.exData = exData

interface Props {
	data?: any
	isPlaceholder?: boolean
}

export default Trend
