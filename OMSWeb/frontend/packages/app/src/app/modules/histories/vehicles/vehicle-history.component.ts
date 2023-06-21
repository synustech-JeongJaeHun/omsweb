import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ClientPreferences } from '@oms/root/models/settings.model'
import { SettingsService } from '@oms/root/services/settings.service'
import { DxDataGridComponent } from 'devextreme-angular'
import DataSource from 'devextreme/data/data_source'
import { HistoriesService } from '../../../services/histories.service'
import { TrackIdService } from '../../../services/track-id.service'
import { DateUtil } from '../../shared/utils/date.util'

@Component({
	selector: 'oms-vehicle-history',
	templateUrl: './vehicle-history.component.html',
	styles: [
		`
			.history-page {
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

			.filter-area {
				padding: 4px 10px;
				display: grid;
				grid-template-columns: 210px 10px 210px 170px;
				justify-items: flex-start;
				align-items: center;
				gap: 4px;
			}

			.search-area {
				display: flex;
				align-items: center;
				gap: 10px;
			}

			.search-area label {
				margin-left: 10px;
				font-size: 12px;
			}

			.filter-area button {
				justify-self: normal;
				align-self: normal;
			}

			.grid-container {
				padding: 0 10px;
			}

			.filter-area .dx-datebox {
			}
		`,
	],
})
export class VehicleHistoryComponent implements OnInit, OnDestroy {
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

  dataSourceRange: DataSource

	searchTime: string
  searchRangeTime: string
  endSearch: number
  bySearch: boolean = false;

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

	constructor(
		private svc: HistoriesService,
		private idSvc: TrackIdService,
		private settingSvc: SettingsService,
	) {
		window.onresize = this.getGridSize.bind(this)
		// this.idSvc.loadIds().subscribe(() => {
		// 	this.dataSource = this.svc.vehiclesDataSource(this.start, this.end)
		// })
		this.idSvc.loadIds().subscribe()
		this.preference = settingSvc.globalPreferences
	}

	ngOnDestroy(): void {
		window.onresize = null
	}

	ngOnInit(): void {
		this.getGridSize()
		this.getFileName()
	}

	preference: ClientPreferences
	canDisplayTable(type: string): boolean {
		return this.preference.historyTables[type]
	}
	getDisplayTableColumnIndex(type: string): number {
		return this.preference.historyTables.vehicles_order.findIndex(
			(column) => column.name === type,
		)
	}
	getDisplayTableColumnWidth(type: string) {
		return this.preference.historyTables.vehicles_order.find(
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
				const column =
					this.preference.historyTables.vehicles_order[c.visibleIndex]
				if (column) column.width = c.width
			})

			this.preference.save()
		},
	}

  private tomorrow = function (date) {
    date.setDate(date.getDate() + 1);
    return date;
  }(new Date)

  search() {
    this.bySearch = true;

    this.dataSource = this.svc.vehiclesDataSource(this, new Date(0), this.tomorrow, Date.now())
  }
	searchRange(startTime: Date, endTime: Date) {
    this.bySearch = true;

		this.dataSourceRange = this.svc.vehiclesDataSourceRange(this, startTime, endTime, Date.now())
	}
	private applyFilter(startTime: Date, endTime: Date) {
		this.dataGrid.instance.filter([
			['historyChangeTime', '>=', startTime],
			'and',
			['historyChangeTime', '<=', endTime],
		])
	}

	private getGridSize(): void {
		const container = document.body
		// const container = document.getElementById('grid-container');
		const { offsetHeight, offsetWidth } = container
		this.gridWidth = offsetWidth/2 - 30
		this.gridHeight = offsetHeight - 94
	}
	private getFileName() {
		var offset = new Date().getTimezoneOffset() * 60000
		var today = new Date(Date.now() - offset)
		this.fileName = today.toISOString() + '-vehicle_history'
	}

  public onDataSourceChanged(startSearch:number) {
    this.searchTime = this.getSearchTime(startSearch);
    this.bySearch = false
  }

  public onDataSourceRangeChanged(startSearch:number) {
    this.searchRangeTime = this.getSearchTime(startSearch);
    this.bySearch = false
  }

  private getSearchTime(startSearch: number): string{
    this.endSearch = Date.now()
    const gap = this.endSearch - startSearch

    const days = Math.floor(gap / (1000 * 60 * 60 * 24)) // 일
    const hour = String(Math.floor((gap / (1000 * 60 * 60)) % 24)).padStart(
      2,
      '0',
    ) // 시
    const minutes = String(Math.floor((gap / (1000 * 60)) % 60)).padStart(
      2,
      '0',
    ) // 분
    const second = String(Math.floor((gap / 1000) % 60)).padStart(2, '0') // 초
    const milisec = String(Math.floor(gap % 1000)).padStart(3, '0') // 밀리

    return  hour + ':' + minutes + ':' + second + '.' + milisec
  }
}
