import { Component } from '@angular/core'

type Stk = {
	id: string
	logicalId: string
}

@Component({
	selector: 'oms-alternate-transfer-setting',
	templateUrl: './alternate-transfer-setting.component.html',
	styleUrls: ['./alternate-transfer-setting.component.scss'],
})
export class AlternateTransferSettingComponent {
	constructor() {
		this.onLoad()
	}

	public mode: 'stb' | 'stk'

	get isModeStb() {
		return this.mode === 'stb'
	}
	get isModeStk() {
		return this.mode === 'stk'
	}
	get isPriorityChangable() {
		return this.selectedChosenStks.length === 1
	}

	// stb related
	public stbCount: number

	// stk related
	public candidateStks: Stk[] = []
	public selectedCandidateStks: Stk['id'][] = []
	public chosenStks: Stk[] = []
	public selectedChosenStks: Stk['id'][] = []

	onLoad() {
		// this.~~~~~service.subscribe(res => {.....})

		// below is sample code for init
		this.mode = 'stb'
		this.stbCount = 5
		this.candidateStks = [
			{ id: '1', logicalId: 'l1' },
			{ id: '2', logicalId: 'l2' },
			{ id: '3', logicalId: 'l3' },
			{ id: '4', logicalId: 'l4' },
			{ id: '5', logicalId: 'l5' },
			{ id: '6', logicalId: 'l6' },
			{ id: '7', logicalId: 'l7' },
			{ id: '8', logicalId: 'l8' },
			{ id: '9', logicalId: 'l9' },
			{ id: '10', logicalId: 'l10' },
		]
		this.chosenStks = [
			{ id: '11', logicalId: 'l11' },
			{ id: '22', logicalId: 'l22' },
			{ id: '33', logicalId: 'l33' },
			{ id: '44', logicalId: 'l44' },
			{ id: '55', logicalId: 'l55' },
			{ id: '66', logicalId: 'l66' },
			{ id: '77', logicalId: 'l77' },
			{ id: '88', logicalId: 'l88' },
			{ id: '99', logicalId: 'l99' },
			{ id: '100', logicalId: 'l100' },
		]
	}

	onSave() {
		if (this.mode === 'stb') {
			// check is undefined
			this.stbCount
			// ...
		}
		if (this.mode === 'stk') {
			// sorted
			this.chosenStks
			// ...
		}
	}

	addToChosenStks() {
		const selecteds = this.selectedCandidateStks.map((id) =>
			this.candidateStks.find((stk) => stk.id === id),
		)

		this.chosenStks = [...this.chosenStks, ...selecteds]
		this.candidateStks = this.candidateStks
			.filter((stk) => selecteds.every((selected) => selected !== stk))
			.sort((a, b) => a.logicalId.localeCompare(b.logicalId))

		this.resetSelecteds()
	}
	removeFromChosenStks() {
		const selecteds = this.selectedChosenStks.map((id) =>
			this.chosenStks.find((stk) => stk.id === id),
		)

		this.candidateStks = [...this.candidateStks, ...selecteds].sort((a, b) =>
			a.logicalId.localeCompare(b.logicalId),
		)
		this.chosenStks = this.chosenStks.filter((stk) =>
			selecteds.every((selected) => selected !== stk),
		)

		this.resetSelecteds()
	}

	private resetSelecteds() {
		this.selectedCandidateStks = []
		this.selectedChosenStks = []
	}

	setHighestPriority() {
		const { index, stk } = this.getSelectedChosenStk()
		this.chosenStks.splice(index, 1)
		this.chosenStks = [stk, ...this.chosenStks]
	}
	setHighPriority() {
		const { index, stk } = this.getSelectedChosenStk()
		if (index === 0) return
		this.chosenStks.splice(index, 1)
		this.chosenStks.splice(index - 1, 0, stk)
	}
	setLowPriority() {
		const { index, stk } = this.getSelectedChosenStk()
		if (index === this.chosenStks.length - 1) return
		this.chosenStks.splice(index, 1)
		this.chosenStks.splice(index + 1, 0, stk)
	}
	setLowestPriority() {
		const { index, stk } = this.getSelectedChosenStk()

		this.chosenStks.splice(index, 1)
		this.chosenStks = [...this.chosenStks, stk]
	}

	private getSelectedChosenStk() {
		const index = this.chosenStks.findIndex((cs) =>
			this.selectedChosenStks.some((scs) => scs === cs.id),
		)
		const stk = this.chosenStks[index]

		return { index, stk }
	}
}
