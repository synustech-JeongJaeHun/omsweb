import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from '@oms/root/services/users.service';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'oms-token-history-control',
  templateUrl: './token-history-control.component.html',
  styleUrls: ['./token-history-control.component.scss'],
})
export class TokenHistoryControlComponent implements OnInit {
  dataSource: DataSource;

  constructor(
    private userSvc: UsersService,
    private t$: TranslateService
  ) { }

  ngOnInit(): void {
    this.dataSource = this.userSvc.tokenHistoryDataSource()
  }
}
