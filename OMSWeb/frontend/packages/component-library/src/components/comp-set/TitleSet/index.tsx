/**
 *
 * TitleSet
 *
 */

import * as React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { color } from '@daimre/styles'
import { numberWithCommas, isFullEmpty, isNotFullEmpty } from '@daimre/shared'
import DatePicker from '../../DatePicker'
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
	isPlaceholder
}: Props) => {
	const qc = React.useContext(QueryContext)
	const { width } = React.useContext(PaneBodyContext)
	const breakpoint = calcBreakpoint(width)
	const _isPlaceholder = qc.isPlaceholder || isPlaceholder
	const hAlign = breakpoint === 'lg' || breakpoint === 'md' ? 'right': 'left'

	return (
		<Wrapper>
			<Container>
				<RCol col={4} sm={12} md={4} lg={5}>
					<div className="title-area">
						<div className="top">
							<div className="title">
								<span className="text">{title}</span>
							</div>
							<div className="picker-wrapper">
								<DatePicker />
							</div>
						</div>
						<div className="bottom">
							{isNotFullEmpty(subtitle) && (
								<button onClick={onClick}>&lt;&nbsp;&nbsp;{subtitle}</button>
							)}
						</div>
					</div>
				</RCol>
				<RCol col={8} sm={12} md={8} lg={7} >
					<Container h={hAlign}>
						<div className="stats">
							{stats.map((item, i) => {
								const { variant, data } = item
								switch (variant) {
									case 'simple':
										return (
											<div key={i.toString()}>
												<SimpleStatBox isPlaceholder={_isPlaceholder} duration="" {...data} />
											</div>
										)
									default:
										return (
											<div key={i.toString()}>
												<DetailStatBox isPlaceholder={_isPlaceholder} {...data} />
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
	isPlaceholder: false
}

interface Props {
	title: string
	subtitle?: string
	stats?: any
	onClick?: (e: any) => void
	isPlaceholder?: boolean
}

export default TitleSet
