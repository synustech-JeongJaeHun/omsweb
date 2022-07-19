import * as React from 'react'
import styled from '@emotion/styled'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import getOptions from './getOptions'

const Wrapper = styled.div<Partial<Props>>`
	display: flex;
	width: 226px;
	height: 86px;
	background-color: #f2f2f2;

	.highcharts-xaxis {
		.highcharts-axis-line {
			stroke: transparent;
		}
	}

	.highcharts-yaxis-grid {
		.highcharts-grid-line {
			stroke: transparent;
		}
	}

	.highcharts-container {
		width: 100% !important;
	}
`

Highcharts.setOptions({
	lang: {
		thousandsSep: ',',
	},
})


const Inline: React.FC<Props> = ({ data, width, name, converter }: Props) => {
	const ref = React.useRef<any>()
	React.useEffect(() => {
		if (ref.current) {
			setTimeout(() => {
				ref.current.chart.reflow()
			}, 10)
		}
	}, [])

	React.useEffect(() => {
		if (ref.current) {
			ref.current.chart.reflow()
		}
	}, [data])

	const options = getOptions({ name, data, width, converter })

	return (
		<Wrapper width={width}>
			<HighchartsReact ref={ref} highcharts={Highcharts} options={options} />
		</Wrapper>
	)
}

Inline.defaultProps = {
	width: 226,
	name: '실제값',
	converter: null,
}

export interface Props {
	data?: any
	width?: number
	name?: string
	converter?: ((any) => void) & null
}

export default Inline
