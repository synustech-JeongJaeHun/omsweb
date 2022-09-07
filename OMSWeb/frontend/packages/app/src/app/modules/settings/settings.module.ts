import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { SettingsRoutingModule } from './settings-routing.module'
import { SettingsComponent } from './settings.component'
import { SettingsDialogComponent } from './dialogs/settings-dialog.component'
import { SharedModule } from '../shared/shared.module'
import { AlternateTransferSettingComponent } from './tracks/alternate-transfer-setting.component'
import { UserManagementComponent } from './preferences/user-management.component'
import { GroupSettingComponent } from './tracks/group-setting.component'
import { ClusterSettingComponent } from './tracks/cluster-setting.component'
import { AlarmSettingComponent } from './tracks/alarm-setting.component'
import { NodeSettingComponent } from './tracks/node-setting.component'
import { ZcuSettingComponent } from './tracks/zcu-setting.component'
import { StationSettingComponent } from './tracks/station-setting.component'
import { BufferSettingComponent } from './tracks/buffer-setting.component'
import { BlockZoneSettingComponent } from './tracks/block-zone-setting.component'
import { RoleManagementComponent } from './preferences/role-management.component'
import { SegmentSettingComponent } from './tracks/segment-setting.component'
import { RoleSettingDialogComponent } from './dialogs/role-setting-dialog.component'
import { UserFormDialogComponent } from './dialogs/user-form-dialog.component'
import { UnitPickerComponent } from './tracks/unit-picker.component'
import { PreferencesComponent } from './preferences/preferences.component'
import { VehicleSettingComponent } from './tracks/vehicle-setting.component'
import { VehicleFormDialogComponent } from './dialogs/vehicle-form-dialog.component'
import { ColumnDisplayManagementComponent } from './preferences/column-display-management.component'
import { SystemPreferenceComponent } from './preferences/system-preference.component'
import { ThemePreferenceComponent } from './preferences/theme-preference.component'
import { BulkUserFormDialogComponent } from './dialogs/bulk-user-from-dialog.component'

@NgModule({
	declarations: [
		SettingsComponent,
		SettingsDialogComponent,
		AlternateTransferSettingComponent,
		UserManagementComponent,
		GroupSettingComponent,
		ClusterSettingComponent,
		AlarmSettingComponent,
		NodeSettingComponent,
		ZcuSettingComponent,
		StationSettingComponent,
		BufferSettingComponent,
		BlockZoneSettingComponent,
		RoleManagementComponent,
		SegmentSettingComponent,
		RoleSettingDialogComponent,
		UserFormDialogComponent,
		UnitPickerComponent,
		PreferencesComponent,
		VehicleSettingComponent,
		VehicleFormDialogComponent,
		ColumnDisplayManagementComponent,
		SystemPreferenceComponent,
		ThemePreferenceComponent,
		BulkUserFormDialogComponent,
	],
	imports: [CommonModule, SharedModule, SettingsRoutingModule],
})
export class SettingsModule {}
