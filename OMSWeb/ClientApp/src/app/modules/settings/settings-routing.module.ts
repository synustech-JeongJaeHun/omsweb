import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleManagementComponent } from './preferences/role-management.component';
import { UserManagementComponent } from './preferences/user-management.component';

import { SettingsComponent } from './settings.component';
import { AlarmSettingComponent } from './tracks/alarm-setting.component';
import { BlockZoneSettingComponent } from './tracks/block-zone-setting.component';
import { BufferSettingComponent } from './tracks/buffer-setting.component';
import { ClusterSettingComponent } from './tracks/cluster-setting.component';
import { GroupSettingComponent } from './tracks/group-setting.component';
import { NodeSettingComponent } from './tracks/node-setting.component';
import { SegmentSettingComponent } from './tracks/segment-setting.component';
import { StationSettingComponent } from './tracks/station-setting.component';
import { ZcuSettingComponent } from './tracks/zcu-setting.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
  },
  { outlet: 'sub', path: 'users', component: UserManagementComponent },
  // { outlet: 'sub', path: 'roles', component: RoleManagementComponent },
  { outlet: 'sub', path: 'tracks/group', component: GroupSettingComponent },
  { outlet: 'sub', path: 'tracks/cluster', component: ClusterSettingComponent },
  { outlet: 'sub', path: 'tracks/alarms', component: AlarmSettingComponent },
  {
    outlet: 'sub',
    path: 'tracks/segment',
    component: SegmentSettingComponent,
  },
  { outlet: 'sub', path: 'tracks/node', component: NodeSettingComponent },
  { outlet: 'sub', path: 'tracks/zcu', component: ZcuSettingComponent },
  {
    outlet: 'sub',
    path: 'tracks/station',
    component: StationSettingComponent,
  },
  {
    outlet: 'sub',
    path: 'tracks/buffer',
    component: BufferSettingComponent,
  },
  // {
  //   outlet: 'sub',
  //   path: 'tracks/blockzone',
  //   component: BlockZoneSettingComponent,
  // },
  // { path: '', redirectTo: '/settings/popup(sub:users)', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
