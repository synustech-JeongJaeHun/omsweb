import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { HistoriesService } from '@oms/services/histories.service'
import DataSource from 'devextreme/data/data_source'
import { TrackIdService } from '@oms/root/services/track-id.service'
import { DateUtil } from '@oms/utils/date.util'
import { DxDataGridComponent } from 'devextreme-angular'
import { SettingsService } from '@oms/root/services/settings.service'
import { ClientPreferences } from '@oms/root/models/settings.model'

@Component({
	selector: 'oms-nack-history',
	templateUrl: './nack-history.component.html',
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
export class NackHistoryComponent implements OnInit, OnDestroy {
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

    searchTime: string
    startSearch: number
    endSearch: number

	setDateWithMaxLimit() {
		this.now = new Date()
	}
	transformLocationId = ({ value = '' }): string => {
		return this.idSvc.guessLocationId(value)
	}
	preference: ClientPreferences

	constructor(
		private svc: HistoriesService,
		private idSvc: TrackIdService,
		private settingSvc: SettingsService,
	) {
		window.onresize = this.getGridSize.bind(this)

		this.idSvc.loadIds().subscribe()
		this.preference = settingSvc.globalPreferences
	}

  search(startTime: Date, endTime: Date) {
        this.searchTime = ''
        this.startSearch = Date.now();

  		console.log('bind Nack Data in component')
		this.dataSource = this.svc.nacksDataSource(this, startTime, endTime)
        this.applyFilter(startTime, endTime)
	}

	canDisplayTable(type: string): boolean {
		return this.preference.historyTables[type]
	}

	getDisplayTableColumnIndex(type: string): number {
		return this.preference.historyTables.nacks_order.findIndex(
			(column) => column.name === type,
		)
	}
	getDisplayTableColumnWidth(type: string) {
		return this.preference.historyTables.nacks_order.find(
			(column) => column.name === type,
		).width
	}
	stateStoring = {
		enabled: true,
		type: 'custom',
		customSave: (configuration: {
			columns: {
				dataField: string
				dataType: string
				name: string
				visible: boolean
				visibleIndex: number
				width: number
			}[]
		}) => {
			configuration.columns.forEach((c) => {
				const column = this.preference.historyTables.nacks_order[c.visibleIndex]
				if (column) column.width = c.width
			})

			this.preference.save()
		},
	}

	private getGridSize(): void {
		const container = document.body
		const { offsetHeight, offsetWidth } = container
		this.gridWidth = offsetWidth - 20
		this.gridHeight = offsetHeight - 94
	}
	private getFileName() {
		var offset = new Date().getTimezoneOffset() * 60000
		var today = new Date(Date.now() - offset)
		this.fileName = today.toISOString() + '-nack_history'
	}
	private applyFilter(startTime: Date, endTime: Date) {
		this.dataGrid.instance.filter([
			['ModifiedTime', '>=', startTime],
			'and',
			['ModifiedTime', '<=', endTime],
		])
	}

	ngOnInit(): void {
		this.getGridSize()
		this.getFileName()
	}
	ngOnDestroy(): void {
		window.onresize = null
    }

    public onDataSourceChanged() {
        this.endSearch = Date.now();
        var gap = this.endSearch - this.startSearch;

        const days = Math.floor(gap / (1000 * 60 * 60 * 24)); // 일
        const hour = String(Math.floor((gap / (1000 * 60 * 60)) % 24)).padStart(2, "0"); // 시
        const minutes = String(Math.floor((gap / (1000 * 60)) % 60)).padStart(2, "0"); // 분
        const second = String(Math.floor((gap / 1000) % 60)).padStart(2, "0"); // 초
        const milisec = String(Math.floor(gap % 1000)).padStart(3, "0"); // 밀리

        this.searchTime = hour + ':' + minutes + ':' + second + "." + milisec;
        console.log('time Transfer history: ' + this.searchTime)
    }
}
