import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatListOption } from '@angular/material/list';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable } from 'rxjs';
import { IRole, IPermission } from '../../../models/user.model';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'oms-role-setting-dialog',
  templateUrl: './role-setting-dialog.component.html',
  styleUrls: ['./role-setting-dialog.component.scss'],
})
export class RoleSettingDialogComponent implements OnInit {
  @ViewChild('newRoleName') newRoleName: ElementRef;

  filteredRoles: IRole[] = [];
  roles: IRole[] = [];
  permissions: IPermission[] = [];
  changedRoles: IRole[] = [];
  removeIds: number[] = [];
  addingMode = false;

  selectedRole: IRole;

  get candidates() {
    return this.changedRoles.filter((x) => x.id === 0);
  }

  constructor(
    private userSvc: UsersService,
    private t$: TranslateService,
    private dialog: MatDialogRef<RoleSettingDialogComponent>
  ) {
    this.userSvc.permissionRoles().subscribe((data) => {
      this.roles = data;
      if (data && data.length > 0) {
        this.filterRoles();
        this.onSelectRole(this.filteredRoles[0]);
      }
    });
    this.userSvc.permissions().subscribe((data) => {
      this.permissions = data;
    });
  }

  ngOnInit(): void { }

  onSelectRole(item: IRole) {
    this.selectedRole = item;
  }

  hasPermission(item: IPermission) {
    return this.selectedRole?.permissions?.includes(item.id);
  }

  onSave() {
    const jobs: Observable<void>[] = [];
    this.removeIds.length &&
      jobs.push(this.userSvc.deleteRoles(this.removeIds));
    this.changedRoles.length &&
      jobs.push(this.userSvc.saveRoles(this.changedRoles));

    jobs.length &&
      forkJoin(jobs).subscribe(() => {
        this.removeIds = [];
        this.changedRoles = [];
        this.dialog.close();
      });
  }

  onAddRole() {
    const newRole: IRole = {
      id: 0,
      name: '',
      permissions: [],
    };
    this.selectedRole = newRole;
    this.addingMode = true;
    setTimeout(() => {
      this.newRoleName.nativeElement.focus();
    }, 0);
  }
  onRemoveRole() {
    if (this.addingMode) return;
    const { id, name } = this.selectedRole;
    if (id === 0) {
      this.changedRoles = this.changedRoles.filter((x) => x.name !== name);
    } else {
      this.removeIds.push(id);
      this.filterRoles();
    }
    this.selectedRole =
      this.filteredRoles.length > 0 ? this.filteredRoles[0] : undefined;
  }
  onCancelAdd() {
    this.addingMode = false;
    this.selectedRole = this.filteredRoles[0];
  }
  onEnterRoleName(name: string) {
    if (!this.isValidRoleName(name))
      throw Error(this.t$.instant('messages.duplicatedRoleName'));
    this.selectedRole.name = name;
    this.changedRoles.push(this.selectedRole);
    this.newRoleName.nativeElement.value = '';
    this.addingMode = false;
  }
  onPermissionChange(selected: MatListOption[]) {
    this.selectedRole.permissions = selected.map((x) => x.value);
    const { id } = this.selectedRole;
    if (id && this.changedRoles.every((x) => x.id !== id)) {
      this.changedRoles.push(this.selectedRole);
    }
  }

  private isValidRoleName(name: string): boolean {
    const key = name.toUpperCase();
    return (
      this.roles.every((x) => x.name.toUpperCase() !== key) &&
      this.changedRoles.every((x) => x.name.toUpperCase() !== key)
    );
  }

  private filterRoles() {
    this.filteredRoles = this.roles.filter(
      (r) => !this.removeIds.includes(r.id)
    );
  }
}
