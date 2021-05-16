import { Component, OnInit } from '@angular/core';

import RemoteFileSystemProvider from 'devextreme/file_management/remote_provider';

import { ILogInfo } from '@oms/models/log.model';

@Component({
  selector: 'oms-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
})
export class LogsComponent implements OnInit {
  logProvider: RemoteFileSystemProvider;
  tabIndex: number = 0;
  selectedItems: any[] = [];
  logList: ILogInfo[] = [];

  constructor() {
    this.logProvider = new RemoteFileSystemProvider({
      endpointUrl: 'assets/json/log-provider.json',
    });
  }

  ngOnInit(): void {}

  onTabChanged() {
    this.selectedItems = [];
  }

  openLog(element: any) {
    this.logList.push({
      name: element.file.path,
    });
    this.tabIndex = this.logList.length - 1;
  }

  clickTabClose(log: ILogInfo) {
    const index = this.logList.indexOf(log);

    this.logList.splice(index, 1);
    this.tabIndex = this.logList.length - 1;
  }
}
