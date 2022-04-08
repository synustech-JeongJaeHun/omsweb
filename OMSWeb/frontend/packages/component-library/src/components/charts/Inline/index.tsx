import * as React from 'react'
import styled from '@emotion/styled'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import getOptions from './getOptions'

const Wrapper = styled.div<Partial<Props>>`
  display: flex;
  width: 226px;
  height: 86px;
	background-color: #F2F2F2;

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

const Inline: React.FC<Props> = ({ data, width }: Props) => {
	const ref = React.useRef<any>()
	React.useEffect(() => {
		if (ref.current) {
			setTimeout(() => {
				ref.current.chart.reflow()
			}, 10)
		}
	}, [])

  return (
    <Wrapper width={width}>
      <HighchartsReact
				ref={ref}
        highcharts={Highcharts}
        options={getOptions({ data, width })}
      />
    </Wrapper>
  )
}

Inline.defaultProps = {
	width: 226
}

interface Props {
  data?: any
	width?: number
}

export default Inline
