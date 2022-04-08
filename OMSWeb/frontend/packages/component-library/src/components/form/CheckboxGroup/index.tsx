/* eslint-disable no-unused-expressions */
import * as React from 'react'
import styled from '@emotion/styled'
import Checkbox from '../Checkbox'

const Wrapper = styled.div``

const CheckBoxGroup: React.FC<Props> = ({
	data,
	disabled = false,
	onChange,
}: Props) => {
	const arr = Array.from({ length: data.length }, () => React.createRef())
	const refs = React.useRef(arr)

	const getValue = () =>
		refs.current.map(({ current }: any) => {
			const { checked, name } = current
				? current
				: { checked: undefined, name: '' }
			return {
				checked,
				name,
			}
		})

	const handleChange = () => {
		const values = getValue()
		onChange && onChange(values)
	}

	return (
		<Wrapper>
			{data.map((item, i) => (
				<Checkbox
					{...item}
					disabled={disabled}
					key={i.toString()}
					onChange={handleChange}
					ref={refs.current[i]}
				/>
			))}
		</Wrapper>
	)
}

interface Props {
	data: {
		checked: boolean
		name: string
		label: string
	}[]
	disabled?: boolean
	onChange?: (
		values: {
			checked: boolean
			name: string
		}[],
	) => void
}

export default CheckBoxGroup
