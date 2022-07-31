import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { HttpClientModule } from '@angular/common/http'
import { TranslateModule } from '@ngx-translate/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MdePopoverModule } from '@material-extended/mde'

import { GnbComponent } from './navs/gnb.component'
import { SharedMaterialModule } from './shared-material.module'
import { GnbMenusComponent } from './navs/gnb-menus.component'
import { GnbStatesComponent } from './navs/gnb-states.component'
import { GnbActionsComponent } from './navs/gnb-actions.component'
import { GnbIndicatorsComponent } from './navs/gnb-indicators.component'
import { SharedDevextremeModule } from './shared-devextreme.module'
import { DialogBaseComponent } from './dialogs/dialog-base.component'
import { SuccessDialogComponent } from './dialogs/success-dialog.component'
import { ErrorDialogComponent } from './dialogs/error-dialog.component'
import { ConfirmDialogComponent } from './dialogs/confirm-dialog.component'
import { AlarmDialogComponent } from './dialogs/alarm-dialog.component'
import { EnumStringPipe } from './pipes/enum-string.pipe'
import { AlertDialogComponent } from './dialogs/alert-dialog.component'
import { LegendDialogComponent } from './dialogs/legend-dialog.component'
import { LoginDialogComponent } from './dialogs/login-dialog.component'
import { UnitSelectorComponent } from './forms/unit-selector.component'
import { ProfileDialogComponent } from './dialogs/profile-dialog.component'
import { UserFormComponent } from './forms/user-form.component'
import { SettingsModule } from '../settings/settings.module'
import { ColorPickerComponent } from './forms/color-picker.component'
import { UnitListSelectorComponent } from './forms/unit-list-selector.component'
import { VehicleFormComponent } from './forms/vehicle-form.component'

const inOutModules = [FormsModule, ReactiveFormsModule]
@NgModule({
	declarations: [
		GnbComponent,
		GnbMenusComponent,
		GnbStatesComponent,
		GnbActionsComponent,
		GnbIndicatorsComponent,
        DialogBaseComponent,
        SuccessDialogComponent,
		ErrorDialogComponent,
		ConfirmDialogComponent,
		AlarmDialogComponent,
		EnumStringPipe,
		AlertDialogComponent,
		LegendDialogComponent,
		LoginDialogComponent,
		UnitSelectorComponent,
		ProfileDialogComponent,
		UserFormComponent,
		ColorPickerComponent,
		UnitListSelectorComponent,
		VehicleFormComponent,
	],
	imports: [
		CommonModule,
		RouterModule,
		HttpClientModule,
		...inOutModules,
		SharedMaterialModule,
		SharedDevextremeModule,
		MdePopoverModule,
		TranslateModule,
	],
	exports: [
		...inOutModules,
		GnbComponent,
		GnbMenusComponent,
		GnbStatesComponent,
		GnbActionsComponent,
		GnbIndicatorsComponent,
		SharedMaterialModule,
		SharedDevextremeModule,
		MdePopoverModule,
		DialogBaseComponent,
        TranslateModule,
        SuccessDialogComponent,
		ErrorDialogComponent,
		ConfirmDialogComponent,
		AlarmDialogComponent,
		EnumStringPipe,
		LoginDialogComponent,
		UnitSelectorComponent,
		ProfileDialogComponent,
		UserFormComponent,
		ColorPickerComponent,
		UnitListSelectorComponent,
		VehicleFormComponent,
	],
})
export class SharedModule {}
