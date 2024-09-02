import { Component, OnInit, ViewChild } from '@angular/core'
import { ClientPreferences } from '@oms/root/models/settings.model'
import { SettingsService } from '@oms/root/services/settings.service'
import { DxDataGridComponent } from 'devextreme-angular'
import DataSource from 'devextreme/data/data_source'
import { HistoriesService } from '../../../services/histories.service'
import { TrackIdService } from '../../../services/track-id.service'
import { DateUtil } from '../../shared/utils/date.util'
import {Router} from "@angular/router";

@Component({
	selector: 'oms-alarm-history',
	templateUrl: './alarm-history.component.html',
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
        grid-template-columns: 210px 10px 210px 1fr 1fr;
				justify-items: flex-start;
				align-items: center;
				gap: 4px;
			}

			#search-area {
				display: flex;
				align-items: center;
				gap: 10px;
			}

			#search-area label {
				margin-left: 10px;
				font-size: 12px;
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

      #playback-area {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-direction: row-reverse;
        width: 100%;
      }
      #playback-area button {
        justify-self: normal;
        align-self: normal;
      }
		`,
	],
})
export class AlarmHistoryComponent implements OnInit {
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

	transform(value: number): string {
		if (value == undefined) {
			return ''
		} else {
			const hour: number = Math.floor(value / 3600)
			const minutes: number = Math.floor((value % 3600) / 60)
			const seconds: number = Math.floor(value % 60)

			//return `${hour}:${minutes}:${seconds}`;
			return (
				hour.toString().padStart(2, '0') +
				':' +
				minutes.toString().padStart(2, '0') +
				':' +
				seconds.toString().padStart(2, '0')
			)
		}
	}

	constructor(
		private svc: HistoriesService,
		private idSvc: TrackIdService,
		private settingSvc: SettingsService,

    private router: Router
	) {
		window.onresize = this.getGridSize.bind(this)
		// this.idSvc.loadIds().subscribe(() => {
		// 	this.dataSource = this.svc.alarmsDataSource(this.start, this.end)
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
		return this.preference.historyTables.alarms_order.findIndex(
			(column) => column.name === type,
		)
	}
	getDisplayTableColumnWidth(type: string) {
		return this.preference.historyTables.alarms_order.find(
			(column) => column.name === type,
		)?.width
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
					this.preference.historyTables.alarms_order[c.visibleIndex]
				if (column) column.width = c.width
			})

			this.preference.save()
		},
	}

	search(startTime: Date, endTime: Date) {
        this.bySearch = true;
        this.onDataSourceStarted();

		this.dataSource = this.svc.alarmsDataSource(this, startTime, endTime)
		//this.applyFilter(startTime, endTime)
		// this.dataSource.reload()
	}
	private applyFilter(startTime: Date, endTime: Date) {
		this.dataGrid.instance.filter([
			['time', '>=', startTime],
			'and',
			['time', '<=', endTime],
		])
	}

    public onDataSourceStarted() {
      this.searchTime = ''
      this.startSearch = null
      this.startSearch = Date.now()
    }

    public onDataSourceChanged() {
        this.endSearch = null
		this.endSearch = Date.now()
		var gap = this.endSearch - this.startSearch

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

		this.searchTime = hour + ':' + minutes + ':' + second + '.' + milisec
        console.log('time Alarm history: ' + this.searchTime)

        this.bySearch = false
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
		this.fileName = today.toISOString() + '-alarm_history'
	}

  cellSelected(e){
    this.dataGrid.instance.deselectAll()
    this.dataGrid.instance.selectRowsByIndexes(e.rowIndex)
  }

  onContextMenuPreparing(e) {
    let items = [];
    const selectedItems = e.component.getSelectedRowKeys();

    if (selectedItems.length === 0) {
      return ;
    } else {
      items = [
        {
          text: "Play Back",
          icon: 'video',
          onClick: () => {
            this.playBack();
          }
        }
      ];
    }
    e.items = items;
  }

  playBack(){
    const data = this.dataGrid.instance.getSelectedRowsData()[0];
    if(!data?.time) return;
    this.router.navigate(['/playback'],{queryParams: {selected: JSON.stringify(data.time)}}).then()
  }

  getDisplayTableLabel(type: string) {
    return this.preference.historyTables.alarms_order.find(
      (column) => column.name === type,
    )?.i18nLabel
  }
}
