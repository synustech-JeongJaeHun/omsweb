import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { MdePopoverModule } from '@material-extended/mde';

import { GnbComponent } from './navs/gnb.component';
import { SharedMaterialModule } from './shared-material.module';
import { GnbMenusComponent } from './navs/gnb-menus.component';
import { GnbStatesComponent } from './navs/gnb-states.component';
import { GnbActionsComponent } from './navs/gnb-actions.component';
import { GnbIndicatorsComponent } from './navs/gnb-indicators.component';

@NgModule({
  declarations: [
    GnbComponent,
    GnbMenusComponent,
    GnbStatesComponent,
    GnbActionsComponent,
    GnbIndicatorsComponent,
  ],
  imports: [CommonModule, SharedMaterialModule, RouterModule, HttpClientModule, MdePopoverModule],
  exports: [
    GnbComponent,
    GnbMenusComponent,
    GnbStatesComponent,
    GnbActionsComponent,
    GnbIndicatorsComponent,
    SharedMaterialModule,
    MdePopoverModule,
  ],
})
export class SharedModule {}
