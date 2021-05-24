import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'oms-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {
  currentMenu: string = 'preference';

  constructor() { }

  ngOnInit(): void {
  }

  isActiveMenu(menu: string) {
    return this.currentMenu === menu;
  }

  onChangeMenu(menu: string) {
    this.currentMenu = menu;
  }

}
