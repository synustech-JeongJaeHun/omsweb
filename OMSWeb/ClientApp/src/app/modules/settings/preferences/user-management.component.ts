import { Component, OnDestroy, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';

import { UsersService } from '@oms/services/users.service';
import { IRole } from '../../../models/user.model';
import { Observable } from 'rxjs';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';
import { RoleSettingDialogComponent } from '../dialogs/role-setting-dialog.component';
import { UserFormDialogComponent } from '../dialogs/user-form-dialog.component';

@Component({
  selector: 'oms-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private _roleDlg: MatDialogRef<RoleSettingDialogComponent>;
  private _userDlg: MatDialogRef<UserFormDialogComponent>;

  dataSource: DataSource;
  roles$: Observable<IRole[]>;
  selectedIds: string[] = [];

  get canRemove(): boolean {
    return this.selectedIds.length > 0;
  }

  constructor(private userSvc: UsersService, private dialog: MatDialog) {
    this.dataSource = this.userSvc.usersDataSource();
    this.roles$ = this.userSvc.roles();
  }
  ngOnDestroy(): void {
    this._roleDlg &&
      this._roleDlg.getState() === MatDialogState.OPEN &&
      this._roleDlg.close();

    this._userDlg &&
      this._userDlg.getState() === MatDialogState.OPEN &&
      this._userDlg.close();
  }

  ngOnInit(): void {}

  onRoleSetting() {
    this._roleDlg = this.dialog.open(RoleSettingDialogComponent, {
      width: '600px',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true,
    });
  }

  onAddUser() {
    this._userDlg = this.dialog.open(UserFormDialogComponent, {
      width: '350px',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true,
    });
  }
  onRemoveUsers() {
    console.log('## remove user >>', this.selectedIds);
  }
  onUpdate(e) {
    console.log('### on update row >>', e);
    return true;
  }
}
