import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { PermissionEnums } from '../../../models/enums';

@Component({
  selector: 'oms-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss'],
})
export class SettingsDialogComponent implements OnInit {
  currentMenu: string = 'preference';
  readonly permissionEnums: typeof PermissionEnums = PermissionEnums;

  constructor(public auth: AuthService) {}

  ngOnInit(): void {}

  isActiveMenu(menu: string) {
    return this.currentMenu === menu;
  }

  onChangeMenu(menu: string) {
    this.currentMenu = menu;
  }
}
