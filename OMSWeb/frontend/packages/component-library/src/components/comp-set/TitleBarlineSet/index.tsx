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
import { numberWithCommas, isFullEmpty, omitArray } from '@daimre/shared'
import Container from '../../layout/Container'
import RCol from '../../layout/RCol'
import Col from '../../layout/Col'
import BarlineTableV from '../../chart-set/BarlineTableV'
import BarlineTableH from '../../chart-set/BarlineTableH'
import BarlineRangeTable from '../../chart-set/BarlineRangeTable'
import TitleSet from '../TitleSet'
import { genNormaltr } from '@daimre/shared'
import { exStatData, exEmptyData } from './exData'
import { useImmer } from 'use-immer'
import { tableConfig } from '../../../utils'
import { QueryContext } from '../../../context'
import ContentPaneBody from '../../ContentPaneBody'
import Scrollable from '../../Scrollable'

type StyleType = {}

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
	padding-top: 30px;
	padding-left: 20px;
	padding-right: 20px;

	.chart-container {
		padding-top: 44px;
	}
`

const dic = {
	duration: '기간별',
	vehicle: 'Vehicle별',
	source: 'Source별',
	dest: 'Dest별',
}

const pageDic = {
	normaltr: 'Normal TR',
	alarm: 'Alarm',
}

const keys = ['duration', 'vehicle', 'source', 'dest']

const getExData = (layoutKey) => {
	return genNormaltr(layoutKey)
}

const makeTableData = (pageVariant, data) => {
	const tc = tableConfig[pageVariant]
	return keys.reduce((acc, key) => {
		const { header, keys: hKeys } = tc[key]
		const _data = data[key]
		acc[key] = {
			header,
			body: _data.map((item) => {
				return item.reduce((_acc, value, i) => {
					const hKey = hKeys[i]
					_acc[hKey] = value
					return _acc
				}, {})
			}),
		}

		return acc
	}, {})
}

const genConfig = (variant, data, pageVariant) => {
	let temp = []
	const ret = makeTableData(pageVariant, data)

	const list = keys.map((key) => {
		return {
			variant: key,
			title: `${dic[key]}`,
			subtext: key !== 'duration' ? '(TOP 6)' : '',
			exportFilename: `${pageVariant}_${key}별`,
			data: ret[key],
			limit: 6,
		}
	})

	switch (variant) {
		case 'vehicle':
		case 'source':
		case 'dest':
			temp = omitArray(['duration', variant], keys, list)
			break
		default:
			temp = omitArray(['duration'], keys, list)
			break
	}

	return {
		main: R.head(list),
		sides: temp,
	}
}

const Pane = ({ variant, data, onClick, onZoom, pageVariant }) => {
	const config = genConfig(variant, data, pageVariant)
	const { main, sides } = config

	return (
		<Container gutter={20}>
			<RCol col={6} sm={12} md={6} lg={6}>
				<BarlineTableV {...main} onClick={onClick} onZoom={onZoom} />
			</RCol>
			<RCol col={6} sm={12} md={6} lg={6}>
				<Container bottomGutter={4}>
					{sides.map((side, i) => {
						return (
							<RCol col={12} sm={12} md={12} lg={12} key={i.toString()}>
								<BarlineTableH {...side} onClick={onClick} onZoom={onZoom} />
							</RCol>
						)
					})}
				</Container>
			</RCol>
		</Container>
	)
}

const DetailChart = ({ variant, data, onClickClose }) => {

	return (
		<div>
			<div>
				<BarlineRangeTable
					title={dic[variant]}
					data={data}
					onClickClose={onClickClose}
					isTimeseries={variant === 'duration'}
				/>
			</div>
		</div>
	)
}

const TitleBarlineSet: React.FC<Props> & any = ({
	pageVariant,
	data,
	stats,
	isPlaceholder
}: Props) => {
	const [state, updateState] = useImmer({
		isZoomed: false,
		isClicked: false,
		layoutKey: 'overview', // overview, duration, vehicle, source, dest
		layoutValue: null,
		zoomedSection: null,
		zoomedData: {
			header: [],
			body: [],
		},
		_data: data,
	})

	React.useEffect(() => {
		updateState(draft => {
			draft._data = data
		})
	}, [data])

	const {
		isZoomed,
		isClicked,
		layoutKey,
		layoutValue,
		zoomedSection,
		zoomedData,
		_data,
	} = state

	const getSectionTitle = () => {
		if (isZoomed) {
			return layoutKey === 'overview'
				? `${dic[zoomedSection]} 전체`
				: `${dic[layoutKey]} - ${layoutValue} | ${dic[zoomedSection]}`
		}

		return layoutKey === 'overview' ? '' : `${dic[layoutKey]} - ${layoutValue}`
	}

	const handleClick = ({ key, value }) => {
		const clickedData = getExData(key)

		updateState((draft) => {
			draft.isClicked = true
			draft.layoutKey = key
			draft.layoutValue = value
			draft._data = clickedData
		})
	}

	const handleClickBack = (e) => {
		if (!isZoomed) {
			updateState((draft) => {
				draft.isClicked = false
				draft.layoutKey = 'overview'
				draft.layoutValue = null
				draft._data = data
			})
		} else {
			updateState((draft) => {
				draft.isZoomed = false
			})
		}
	}

	const handleZoom = ({ variant: chartType, data }) => {
		updateState((draft) => {
			draft.isZoomed = true
			draft.zoomedSection = chartType
			draft.zoomedData = data
		})
	}

	const handleZoomout = () => {
		updateState((draft) => {
			draft.isZoomed = false
		})
	}

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
								<TitleSet
									title={pageDic[pageVariant]}
									subtitle={getSectionTitle()}
									onClick={handleClickBack}
									stats={stats}
								/>
								<div className="chart-container">
									{!isZoomed ? (
										<Pane
											variant={layoutKey}
											data={_data}
											onClick={handleClick}
											onZoom={handleZoom}
											pageVariant={pageVariant}
										/>
									) : (
										<DetailChart
											variant={zoomedSection}
											data={zoomedData}
											onClickClose={handleZoomout}
										/>
									)}
								</div>
							</RCol >
						</Container >
						<div className="space"></div>
					</Wrapper>
				</Scrollable>
			</ContentPaneBody>
		</ QueryContext.Provider>
	)
}

TitleBarlineSet.exEmptyData = exEmptyData
TitleBarlineSet.exStatData = exStatData
TitleBarlineSet.genNormaltr = genNormaltr

TitleBarlineSet.defaultProps = {
	data: getExData('overview'),
	pageVariant: 'alarm',
	stats: exStatData.alarm,
	isPlaceholder: false
}

interface Props {
	data?: any
	pageVariant?: 'normaltr' | 'alarm'
	stats?: any
	isPlaceholder?: boolean
}

export default TitleBarlineSet
