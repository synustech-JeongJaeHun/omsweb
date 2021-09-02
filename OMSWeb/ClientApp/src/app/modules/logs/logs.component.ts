import { NgModule, ViewChild, Component, OnInit } from '@angular/core';
import RemoteFileSystemProvider from 'devextreme/file_management/remote_provider';
import { DxFileManagerModule, DxFileManagerComponent } from 'devextreme-angular';
import FileManager from 'devextreme/ui/file_manager';
import { ILogInfo } from '@oms/models/log.model';
import { SystemsService } from '../../services/systems.service';
import { IFileItem } from '../../models/system.model';
import { Observable } from 'rxjs';
import { DirectiveResolver } from '@angular/compiler';

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

    //if (e.itemData.name == "customDownload") {
    if (e.itemData.name = "customDownload") {
    
      //alert("need to do download action");

      //alert('Selected Item : [' + this.fileManager.instance.getSelectedItems() + ']');

      if (this.fileManager.instance.getSelectedItems() == null || this.fileManager.instance.getSelectedItems().length == 0) {
        
        //alert('this is a directory');
        var directory = e.fileSystemItem || this.fileManager.instance.getCurrentDirectory();
        //alert(directory.name + ' - ' + directory.key);

        this.systemSvc.downloadFolderItems(directory.name, directory.key);
        /*
        this.systemSvc.downloadFolderItems(directory.name, directory.key).subscribe((res) => {
          return res;
        });
        */
      } else {
        //alert('selected : ' + this.fileManager.instance.getSelectedItems());
        var items = null;

        items = this.fileManager.instance.getSelectedItems();

        items.forEach(function (item) {
          if (item.dataItem) {
            //alert(item.dataItem.name + ' - ' + item.dataItem.key);
          }
        });

        this.systemSvc.downloadFileItems(items);
        /*
        this.systemSvc.downloadFileItems(items).subscribe((res) => {
          return res;
        });
        */
      }
    }
  }
}
