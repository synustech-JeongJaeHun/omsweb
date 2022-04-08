import { css } from '@emotion/react'
import { color } from '../constants'

const highchartsReset = css`
  /* .highcharts-title {
    display: none;
  } */

  .highcharts-background {
    /* fill: ${color.bg}; */
    fill: transparent;
  }

  .highcharts-credits {
    display: none;
  }

  .highcharts-yaxis-grid {
    .highcharts-grid-line {
      stroke: ${color.line};
    }
  }

  .highcharts-xaxis {
    .highcharts-axis-line {
      stroke: ${color.line};
    }
  }

  .highcharts-tick {
    stroke: ${color.line};
  }
`

export default highchartsReset
