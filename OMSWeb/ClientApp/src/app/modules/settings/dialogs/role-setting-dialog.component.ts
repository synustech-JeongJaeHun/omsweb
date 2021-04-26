import { Component, OnInit } from '@angular/core';
import { IRole, IPermission } from '../../../models/user.model';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'oms-role-setting-dialog',
  templateUrl: './role-setting-dialog.component.html',
  styleUrls: ['./role-setting-dialog.component.scss'],
})
export class RoleSettingDialogComponent implements OnInit {
  roles: IRole[] = [];
  permissions: IPermission[] = [];

  selectedRole: IRole;

  constructor(private userSvc: UsersService) {
    this.userSvc.permissionRoles().subscribe((data) => {
      this.roles = data;
      if (data && data.length > 0) {
        this.onSelectRole(data[0]);
      }
    });
    this.userSvc.permissions().subscribe((data) => {
      this.permissions = data;
    });
  }

  ngOnInit(): void {}

  onSelectRole(item: IRole) {
    this.selectedRole = item;
  }

  hasPermission(item: IPermission) {
    return this.selectedRole.permissions?.includes(item.id);
  }
}
