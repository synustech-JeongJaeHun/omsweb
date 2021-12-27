import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from '@oms/root/services/users.service';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'oms-token-history-control',
  templateUrl: './token-history-control.component.html',
  styleUrls: ['./token-history-control.component.scss'],
})
export class TokenHistoryControlComponent implements OnInit, OnDestroy {
  dataSource: DataSource;

  intervalTimer: number;

  private readonly intervalTime = 5000;

  constructor(
    private userSvc: UsersService,
    private t$: TranslateService
  ) { }

  ngOnInit(): void {
    this.dataSource = this.userSvc.tokenHistoryDataSource()

    this.intervalTimer = (setInterval(() => {
      this.dataSource.reload();
    }, this.intervalTime) as any)
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalTimer)
  }
}
