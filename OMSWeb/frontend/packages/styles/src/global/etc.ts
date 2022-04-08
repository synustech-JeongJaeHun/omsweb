import { css } from '@emotion/react'

const etc = css`
	@font-face {
		font-family: DXIcons;
		src: local('DevExtreme Generic Icons'), local('devextreme_generic_icons'),
			url('/assets/icons/dxicons.woff2') format('woff2'),
			url('/assets/icons/dxicons.woff') format('woff'),
			url('/assets/icons/dxicons.ttf') format('truetype');
		font-weight: 400;
		font-style: normal;
	}

	.dx-datagrid-headers {
		color: #000000;
		background-color: #f2f2f2;
		border-bottom: none;
	}
`

export default etc
