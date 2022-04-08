import { css } from '@emotion/react'

import { typography, color, zIndex } from '../constants'
import sanitizer from './sanitizer'
import fontFace from './fontface'
import base from './base'
import dataviz from './dataviz'
import reactDatesReset from './react-dates-reset'
import highchartsReset from './highcharts-reset'

const globalStyle = css`
	${sanitizer}
	${fontFace}
  ${base}

  * {
		box-sizing: border-box;
		font-family: ${typography.type.primary};
	}

	html {
		background-color: ${color.bg};
		height: 100%;
	}

	body {
		font: ${typography.size.s4}px ${typography.type.primary};
		font-weight: 400;
		line-height: ${typography.lineHeight.default};
		color: ${color.text};
		/* overflow: hidden; */
		height: 100%;
		z-index: ${zIndex.zero};
		position: relative;

		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		-webkit-tap-highlight-color: transparent;
		-webkit-overflow-scrolling: touch;
	}

	${dataviz}
	${reactDatesReset}
  ${highchartsReset}
`

export default globalStyle
