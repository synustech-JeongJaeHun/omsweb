import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { HistoriesService } from '@oms/services/histories.service'
import DataSource from 'devextreme/data/data_source'
import { TrackIdService } from '../../../services/track-id.service'
import { DateUtil } from '@oms/utils/date.util'
import { DxDataGridComponent } from 'devextreme-angular'

@Component({
	selector: 'oms-transfer-history',
	templateUrl: './transfer-history.component.html',
	styles: [
		`
			#history-page {
				background-color: var(--panel-background-color);
				display: grid;
				grid-template-rows: 40px auto;
				left: 0;
				right: 0;
				bottom: 0;
				top: 44px;
				gap: 4px;
				height: 100%;
			}

			#filter-area {
				padding: 4px 10px;
				display: grid;
				grid-template-columns: 210px 10px 210px 120px;
				justify-items: center;
				align-items: center;
				gap: 4px;
			}

			#filter-area button {
				justify-self: normal;
				align-self: normal;
			}

			#grid-container {
				padding: 0 10px;
			}

			#filter-area .dx-datebox {
			}
		`,
	],
})
export class TransferHistoryComponent implements OnInit, OnDestroy {
	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

	dateTimeFormat = DateUtil.DateTimeFormat
	gridWidth = 0
	gridHeight = 0
	creatorList = []
	searchTypeList = []

	now: Date = new Date()
	start: Date = new Date(
		this.now.getFullYear(),
		this.now.getMonth(),
		this.now.getDate(),
		this.now.getHours() - 6,
	)
	base: Date = new Date(
		this.now.getFullYear() - 20,
		this.now.getMonth(),
		this.now.getDate(),
	)
	end: Date = new Date(
		this.now.getFullYear(),
		this.now.getMonth(),
		this.now.getDate(),
		this.now.getHours(),
		this.now.getMinutes() + 30,
	)
	fileName: string

	dataSource: DataSource

	setDateWithMaxLimit() {
		this.now = new Date()
	}

	transformVehicleId = ({ value = '' }): string => {
		const text =
			this.idSvc.get_alternative_id('vehicle', 'logicalId', value) || value
		return text.toString()
	}

	transformLocationId = ({ value = '' }): string => {
		return this.idSvc.guessLocationId(value)
	}

	constructor(private svc: HistoriesService, private idSvc: TrackIdService) {
		window.onresize = this.getGridSize.bind(this)
		this.idSvc.loadIds().subscribe(() => {
			this.dataSource = this.svc.ordersDataSource(this.start, this.end)
		})
	}

	ngOnDestroy(): void {
		window.onresize = null
	}

	ngOnInit(): void {
		this.getGridSize()
		this.getFileName()
	}

	search(startTime: Date, endTime: Date) {
		this.applyFilter(startTime, endTime)
		this.dataSource.reload()
	}
	private applyFilter(startTime: Date, endTime: Date) {
		this.dataGrid.instance.filter([
			['timeCreated', '>=', startTime],
			'and',
			['timeCreated', '<=', endTime],
		])
	}

	private getGridSize(): void {
		const container = document.body
		// const container = document.getElementById('grid-container');
		const { offsetHeight, offsetWidth } = container
		this.gridWidth = offsetWidth - 20
		this.gridHeight = offsetHeight - 94
	}
	private getFileName() {
		var offset = new Date().getTimezoneOffset() * 60000
		var today = new Date(Date.now() - offset)
		this.fileName = today.toISOString() + '-order_history'
	}
}
