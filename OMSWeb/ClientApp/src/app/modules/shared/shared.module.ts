import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdePopoverModule } from '@material-extended/mde';

import { GnbComponent } from './navs/gnb.component';
import { SharedMaterialModule } from './shared-material.module';
import { GnbMenusComponent } from './navs/gnb-menus.component';
import { GnbStatesComponent } from './navs/gnb-states.component';
import { GnbActionsComponent } from './navs/gnb-actions.component';
import { GnbIndicatorsComponent } from './navs/gnb-indicators.component';
import { SharedDevextremeModule } from './shared-devextreme.module';
import { DialogBaseComponent } from './dialogs/dialog-base.component';

const inOutModules = [
  FormsModule,
  // ReactiveFormsModule,
];
@NgModule({
  declarations: [
    GnbComponent,
    GnbMenusComponent,
    GnbStatesComponent,
    GnbActionsComponent,
    GnbIndicatorsComponent,
    DialogBaseComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    ...inOutModules,
    SharedMaterialModule,
    SharedDevextremeModule,
    MdePopoverModule,
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
  ],
})
export class SharedModule {}
