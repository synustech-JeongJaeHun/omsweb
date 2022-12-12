/* eslint-disable no-unused-expressions */
/* eslint-disable react/jsx-props-no-spreading */
/** @jsxRuntime classic */
/** @jsx jsx */
import * as React from 'react'
import styled from '@emotion/styled'
import { css, jsx } from '@emotion/react'
import { color } from '@daimre/styles'
import { makeid } from '@daimre/shared'

const Wrapper = styled.div<Pick<Props, 'disabled' | 'block'>>`
	display: ${({ block }) => (block ? 'block' : 'inline-block')};
	position: relative;
	margin-right: 17px;

	&:last-child {
		margin-right: 0;
	}

	input[type='checkbox'] {
		width: auto;
		opacity: 0.00000001;
		position: absolute;
		left: 0;
		margin-left: -20px;

		&:checked ~ label {
			&:before {
				border: 1px solid ${color.inputLine};
			}
			&:after {
				transform: rotate(-45deg) scale(1);
			}
		}

		&:hover {
			& + label:before {
				border-color: #63759a;
			}
		}
		&:focus + label::before {
			outline: 0;
		}
	}

	label {
		position: relative;
		min-height: 26px;
		display: flex;
		align-items: center;
		padding-left: 30px;
		margin-bottom: 0;
		font-size: 12px;
		font-weight: normal;
		cursor: pointer;

		span {
			position: relative;
			top: 1px;
		}

		&:before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			margin: 4px;
			width: 18px;
			height: 18px;
			transition: transform 0.28s ease, border-color 0.2s ease;
			border-radius: 2px;
			border: 1px solid ${color.inputLine};
		}
		&:after {
			content: '';
			display: block;
			width: 10px;
			height: 5px;
			border-bottom: 2px solid ${color.inputLine};
			border-left: 2px solid ${color.inputLine};
			transform: rotate(-45deg) scale(0);
			/* transition: transform ease 0.25s; */
			position: absolute;
			top: 10px;
			left: 8px;
		}
	}

	${({ disabled }) =>
		disabled &&
		css`
			pointer-events: none;
			opacity: 0.4;

			input[type='checkbox'] {
				&:checked ~ label {
					&:before {
						border-color: #56595f;
					}
				}
			}
			label {
				&:before {
					border-color: #56595f;
				}
				&:after {
					border-bottom-color: #56595f;
					border-left-color: #56595f;
				}
			}
		`}
`

const CheckBox = React.forwardRef(
	(
		{
			name,
			checked = false,
			label,
			block,
			disabled,
			onChange,
			...props
		}: Props,
		inRef,
	) => {
		const id = `${name}-${makeid(8)}`
		const [isChecked, setIsChecked] = React.useState(checked)

		const ref = React.useRef(null)

		const handleChange = (e) => {
			setIsChecked(e.target.checked)
			onChange && onChange(e.target.checked)
		}

		React.useImperativeHandle(inRef, () => ref.current, [ref])

		return (
			<Wrapper block={block} disabled={disabled}>
				<input
					type="checkbox"
					name={name}
					checked={isChecked}
					id={id}
					ref={ref}
					onChange={handleChange}
					{...props}
				/>
				<label htmlFor={id}>
					<span>{label || ''}</span>
				</label>
			</Wrapper>
		)
	},
)

CheckBox.defaultProps = {
	disabled: false,
}

interface Props {
	name: string
	checked?: boolean
	label?: string
	block?: boolean
	disabled?: boolean
	onChange?: (checked: boolean) => void
	props?: any
}

export default CheckBox
