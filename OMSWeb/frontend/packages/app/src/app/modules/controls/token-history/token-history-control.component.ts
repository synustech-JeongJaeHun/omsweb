import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from '@oms/root/services/users.service';
import DataSource from 'devextreme/data/data_source';
import {DateUtil} from "@oms/utils/date.util";

@Component({
  selector: 'oms-token-history-control',
  templateUrl: './token-history-control.component.html',
  styleUrls: ['./token-history-control.component.scss'],
})
export class TokenHistoryControlComponent implements OnInit, OnDestroy {
  dataSource: DataSource;

	gridWidth = 0
	gridHeight = 0
  intervalTimer: number;
	dateTimeFormat = DateUtil.DateTimeFormat

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

	searchTime: string
	startSearch: number
	endSearch: number
	bySearch: boolean = false;

	setDateWithMaxLimit() {
		this.now = new Date()
	}
	
  private readonly intervalTime = 5000;

  constructor(
    private userSvc: UsersService,
    private t$: TranslateService
  ) {
	  window.onresize = this.getGridSize.bind(this)
  }

  ngOnInit(): void {
	  this.getGridSize()
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalTimer)
  }

	search(startTime: Date, endTime: Date) {
		this.bySearch = true;
		this.onDataSourceStarted();

		this.dataSource = this.userSvc.tokenHistoryDataSource(this, startTime, endTime)
	}

	public onDataSourceStarted() {
		this.searchTime = ''
		this.startSearch = null
		this.startSearch = Date.now()
	}

	public onDataSourceChanged() {
		this.endSearch = null
		this.endSearch = Date.now()
		const gap = this.endSearch - this.startSearch

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
		console.log('time token history: ' + this.searchTime)

		this.bySearch = false
	}

	private getGridSize(): void {
		const container = document.body
		const { offsetHeight, offsetWidth } = container
		this.gridWidth = offsetWidth - 80
		this.gridHeight = offsetHeight - 180
	}
}
