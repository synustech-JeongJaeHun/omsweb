import {ViewChild, Component, OnInit} from '@angular/core';
import { DxFileManagerComponent } from 'devextreme-angular';
import { ILogInfo } from '@oms/models/log.model';
import { SystemsService } from '../../services/systems.service';
import { IFileItem } from '../../models/system.model';
import {finalize} from "rxjs/operators";
import {DialogService} from "../../services/dialog.service";
import {TranslateService} from "@ngx-translate/core";

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

  isLoading = false

  constructor(
    private systemSvc: SystemsService,
    private dialogSvc: DialogService,
    private t$: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.load().then(()=>{
      setTimeout(()=>{
          this.fileManager.instance.refresh()
        }, 300)
    })

  }

  buttonOptions = {
    text: "",
    type: "",
    useSubmitBehavior: true,
    onClick: ()=>{
      this.load()
    }
  };

  async load(){
    this.isLoading = true
    await this.systemSvc.fileItems()
      .pipe(
        finalize(()=>{
          this.isLoading = false
        })
      )
      .subscribe((res) => {
         this.fileItems = res;
      })
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
      this.isLoading = true
      if (this.fileManager.instance.getSelectedItems() == undefined || this.fileManager.instance.getSelectedItems().length == 0) {
        let directory = e.fileSystemItem || this.fileManager.instance.getCurrentDirectory();
        //alert(directory.name + ' - ' + directory.key);
        if(!directory.name || !directory.key) return
        this.systemSvc.downloadFolder(directory.name, directory.key).subscribe(blob => {
          const a = document.createElement('a')
          const objectUrl = URL.createObjectURL(blob)
          a.href = objectUrl
          a.download = directory.name + '.zip';
          a.click();
          URL.revokeObjectURL(objectUrl);

          this.isLoading = false
        });
      } else {
        //alert('selected : ' + this.fileManager.instance.getSelectedItems());
        let items = null;
        let paths: string[] = new Array();
        let directory = e.fileSystemItem || this.fileManager.instance.getCurrentDirectory();

        items = this.fileManager.instance.getSelectedItems();

        items.forEach(function (item) {
          if (item.dataItem) {
            //alert(item.dataItem.name + ' - ' + item.dataItem.key + ' - ' + item.dataItem.isDirectory);
            paths.push(item.dataItem.key);
          }
        });

        //alert('items = (' + items + ') count = (' + items.length + ') : ' + items[0].dataItem.isDirectory);
        if (items != undefined && items.length == 1 && !items[0].dataItem.isDirectory && items[0].dataItem.size < 10485760) {    // 10MB = 10 * 1024 * 1024
          this.systemSvc.downloadFile(items[0].dataItem.name, items[0].dataItem.key)
            .pipe(
              finalize(() => this.isLoading = false),
            )
            .subscribe(blob => {
            const a = document.createElement('a')
            const objectUrl = URL.createObjectURL(blob)
            a.href = objectUrl
            a.download = items[0].dataItem.name;
            a.click();
            URL.revokeObjectURL(objectUrl);
          }, error => {
              this.dialogSvc.alert({
                title: this.t$.instant('alerts'),
                body: 'Download failed!'
              })
            });
        } else if (items != undefined && items.length >= 1) {
          this.systemSvc.downloadFoldersNFiles(directory.name, paths)
            .pipe(
              finalize(() => this.isLoading = false),
            )
            .subscribe(blob => {
            const a = document.createElement('a')
            const objectUrl = URL.createObjectURL(blob)
            a.href = objectUrl
            a.download = directory.name + '.zip';
            a.click();
            URL.revokeObjectURL(objectUrl);
          }, error => {
              this.dialogSvc.alert({
                title: this.t$.instant('alerts'),
                body: 'Download failed!'
              })
            });
        } else {
          alert('Need to select folder or file');
          this.isLoading = false
        }
      }
    }
  }
}
