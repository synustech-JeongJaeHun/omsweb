import { Component, OnInit } from '@angular/core';

import RemoteFileSystemProvider from 'devextreme/file_management/remote_provider';

import { ILogInfo } from '@oms/models/log.model';
import { SystemsService } from '../../services/systems.service';
import { IFileItem } from '../../models/system.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'oms-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
})
export class LogsComponent implements OnInit {
  fileItems: IFileItem[];
  tabIndex: number = 0;
  selectedItems: any[] = [];
  logList: ILogInfo[] = [];

  constructor(
    private systemSvc: SystemsService
  ) {
  }

  ngOnInit(): void {

    this.systemSvc.fileItems().subscribe((res) => {
      this.fileItems = res;
    });
  }

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
