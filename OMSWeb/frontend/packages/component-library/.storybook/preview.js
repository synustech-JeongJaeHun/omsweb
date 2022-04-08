import React from 'react'
import { Global } from '@emotion/react'
import { globalStyle } from '@daimre/styles'
import { themes } from '@storybook/theming'
import { MemoryRouter } from 'react-router-dom'
import 'react-dates/lib/css/_datepicker.css'
import 'devextreme/dist/css/dx.light.compact.css'

export const parameters = {
	docs: {},
	actions: { argTypesRegex: '^on[A-Z].*' },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
}

const withGlobalStyle = (storyFn) => (
	<>
		<Global styles={globalStyle} />
		{storyFn()}
	</>
)

export const decorators = [
	withGlobalStyle,
	(Story) => (
		<MemoryRouter>
			<Story />
		</MemoryRouter>
	),
]
