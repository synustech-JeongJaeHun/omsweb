import { NgModule, ViewChild, Component, OnInit } from '@angular/core';
import RemoteFileSystemProvider from 'devextreme/file_management/remote_provider';
import { DxFileManagerModule, DxFileManagerComponent } from 'devextreme-angular';
import FileManager from 'devextreme/ui/file_manager';
import { ILogInfo } from '@oms/models/log.model';
import { SystemsService } from '../../services/systems.service';
import { IFileItem } from '../../models/system.model';
import { Observable } from 'rxjs';
import { DirectiveResolver } from '@angular/compiler';
import { blob } from 'd3-fetch';

@Component({
  selector: 'oms-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
})
export class LogsComponent implements OnInit {
  @ViewChild(DxFileManagerComponent, { static: false }) fileManager: DxFileManagerComponent;
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

  onToolbarItemClick(e) {
    if (e.itemData.name == "customDownload") {
      //alert('Selected Item : [' + this.fileManager.instance.getSelectedItems() + ']' + this.fileManager.instance.getCurrentDirectory().name + ' - ' + this.fileManager.instance.getCurrentDirectory().fullPath + ' - ' + this.fileManager.instance.getCurrentDirectory().key);
      if (this.fileManager.instance.getSelectedItems() == undefined || this.fileManager.instance.getSelectedItems().length == 0) {
        var directory = e.fileSystemItem || this.fileManager.instance.getCurrentDirectory();

        //alert(directory.name + ' - ' + directory.key);
        this.systemSvc.downloadFolder(directory.name, directory.key).subscribe(blob => {
          const a = document.createElement('a')
          const objectUrl = URL.createObjectURL(blob)
          a.href = objectUrl
          a.download = directory.name + '.zip';
          a.click();
          URL.revokeObjectURL(objectUrl);
        });
      } else {
        //alert('selected : ' + this.fileManager.instance.getSelectedItems());
        var items = null;
        var paths: string[] = new Array();
        var directory = e.fileSystemItem || this.fileManager.instance.getCurrentDirectory();

        items = this.fileManager.instance.getSelectedItems();

        items.forEach(function (item) {
          if (item.dataItem) {
            //alert(item.dataItem.name + ' - ' + item.dataItem.key + ' - ' + item.dataItem.isDirectory);
            paths.push(item.dataItem.key);
          }
        });

        //alert('items = (' + items + ') count = (' + items.length + ') : ' + items[0].dataItem.isDirectory);
        if (items != undefined && items.length == 1 && !items[0].dataItem.isDirectory && items[0].dataItem.size < 10485760) {    // 10MB = 10 * 1024 * 1024
          this.systemSvc.downloadFile(items[0].dataItem.name, items[0].dataItem.key).subscribe(blob => {
            const a = document.createElement('a')
            const objectUrl = URL.createObjectURL(blob)
            a.href = objectUrl
            a.download = items[0].dataItem.name;
            a.click();
            URL.revokeObjectURL(objectUrl);
          });
        } else if (items != undefined && items.length >= 1) {
          this.systemSvc.downloadFoldersNFiles(directory.name, paths).subscribe(blob => {
            const a = document.createElement('a')
            const objectUrl = URL.createObjectURL(blob)
            a.href = objectUrl
            a.download = directory.name + '.zip';
            a.click();
            URL.revokeObjectURL(objectUrl);
          });
        } else {
          alert('Need to select folder or file');
        }
      }
    }
  }
}
