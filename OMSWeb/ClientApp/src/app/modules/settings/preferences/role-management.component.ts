import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IPermission, IRole } from '../../../models/user.model';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'oms-role-management',
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss'],
})
export class RoleManagementComponent implements OnInit {
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
    return this.selectedRole.permissions.includes(item.id);
  }
}
