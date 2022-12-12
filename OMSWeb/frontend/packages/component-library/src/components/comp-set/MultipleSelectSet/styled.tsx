import styled from '@emotion/styled'
import { css } from '@emotion/react'

type StyleType = {
	color: string
}

export const Wrapper = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	position: relative;

	.mss-header {
		flex: 0 0 80px;
	}

	.mss-color-pickers {
		flex: 0 0 100px;
		margin-bottom: 10px;

		.color-checker {
			display: flex;
			align-items: center;
			width: 182px;

			.color-chip {
				display: inline-block;
				padding: 5px;
				background: #fff;
				border-radius: 1px;
				cursor: pointer;
				border: 1px solid black;
				height: 15px;
				width: 30px;
			}
		}

		ul {
			display: flex;
			flex-wrap: wrap;

			li {
				margin-right: 10px;
				margin-bottom: 7px;
			}
		}
	}

	.mss-body {
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: 100%;
	}

	.container {
		height: 100%;
		display: flex;
		margin-left: -10px;
		margin-right: -10px;

		& > .col {
			height: 100%;
			padding-right: 10px;
			padding-left: 10px;
			margin-left: 0;
			margin-right: 0;

			h3 {
				font-size: 16px;
				font-weight: bold;
				padding-bottom: 15px;
				padding-left: 10px;
				flex: 0 0 32px;
			}

			&.has-select-wrapper {
				display: flex;
				flex-direction: column;

				.select-wrapper {
					flex: 1 1 auto;
					overflow: auto;
				}
			}

			&.col-1-5 {
				width: 20%;
			}
			&.col-2-5 {
				width: 40%;
			}
			&.col-3-5 {
				width: 60%;
			}
			&.col-1-2 {
				width: 50%;
			}
		}
	}

	.col-inner {
		height: 100%;
		display: flex;
		flex-direction: column;

		.container {
			height: auto;
			flex: 1 1 auto;
			overflow: auto;
		}
	}

	.mss-footer {
		margin-top: 20px;
		flex: 0 0 50px;

		button {
      margin-right: 5px;

      &:last-of-type {
        margin-right: 0;
      }
		}
	}
`

export const ColorChip = styled.button<Partial<StyleType>>`
	display: inline-block;
	padding: 5px;
	border-radius: 1px;
	cursor: pointer;
	border: 1px solid black;
	height: 15px;
	width: 30px;
	margin-left: -8px;

	${({ color }) => css`
		background-color: ${color};
	`}
`
