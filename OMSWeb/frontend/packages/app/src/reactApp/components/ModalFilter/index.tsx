// @ts-nocheck
import * as React from 'react'
import * as Modal from 'react-modal'
import styled from '@emotion/styled'
import {
	MultipleSelectSet,
	MultipleSelectSetProps,
	Icon,
	Button,
} from '@synusdev/component-library'
import { useCount } from '@synusdev/shared'

const customStyles = {
	overlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.75)',
		zIndex: 1001,
	},
	content: {
		top: '50%',
		left: '50%',
		width: '1000px',
		height: '700px',
		transform: 'translate(-50%, -50%)',
	},
}

const ModalInner: any = styled.div`
	display: flex;
	position: relative;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;

	.button-wrapper {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 2;
	}

	.filter-wrapper {
		flex: 1 1 auto;
		overflow: auto;

		display: flex;
		justify-content: center;
		align-items: center;
	}
`

const propObj = { style: customStyles }

Modal.setAppElement('oms-root')

const ModalFilter: React.FC<Props> & any = React.forwardRef(
	(
		{ variant, labels, initialLegends, initialSelection, onApply }: Props,
		inRef: any,
	) => {
		const ref = React.useRef(null)
		const [count, inc] = useCount()
		const [modalIsOpen, setIsOpen] = React.useState(false)

		React.useEffect(() => {
			if (count > 0) {
				setIsOpen(true)
			}
		}, [count])

		const handleClickConfig = () => {
			setIsOpen(!modalIsOpen)
		}

		const handleClickClose = () => {
			setIsOpen(false)
		}

		React.useImperativeHandle(inRef, () => ({
			openModal: () => inc(),
		}))

		const handleApply = (values) => {
			onApply && onApply(values)
			setIsOpen(false)
		}

		return (
			<Modal
				isOpen={modalIsOpen}
				onRequestClose={handleClickClose}
				contentLabel="Example Modal"
				style={customStyles}
			>
				<ModalInner>
					<div className="button-wrapper">
						<Button transparent onClick={handleClickConfig}>
							<Icon name="close" color="black" />
						</Button>
					</div>
					<div className="filter-wrapper">
						<MultipleSelectSet
							variant={variant}
							labels={labels}
							onClose={handleClickClose}
							initialLegends={initialLegends}
							initialSelection={initialSelection}
							onApply={handleApply}
						/>
					</div>
				</ModalInner>
			</Modal>
		)
	},
)

ModalFilter.defaultProps = {
	variant: 'normaltr',
	labels: [],
	initialSelection: MultipleSelectSet.defaultState.selection,
	onApply: () => {},
}

interface Props extends MultipleSelectSetProps {}

export default ModalFilter
