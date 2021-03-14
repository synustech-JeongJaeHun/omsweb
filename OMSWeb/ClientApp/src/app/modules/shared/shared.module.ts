import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

import { GnbComponent } from './navs/gnb.component';
import { SharedMaterialModule } from './shared-material.module';
import { GnbMenusComponent } from './navs/gnb-menus.component';
import { GnbStatesComponent } from './navs/gnb-states.component';
import { GnbActionsComponent } from './navs/gnb-actions.component';
import { GnbIndicatorsComponent } from './navs/gnb-indicators.component';
import { MapViewerComponent } from './viewers/map-viewer.component';
import { MapToolbarComponent } from './viewers/map-toolbar.component';

@NgModule({
  declarations: [
    GnbComponent,
    GnbMenusComponent,
    GnbStatesComponent,
    GnbActionsComponent,
    GnbIndicatorsComponent,
    MapViewerComponent,
    MapToolbarComponent,
  ],
  imports: [CommonModule, SharedMaterialModule, RouterModule, HttpClientModule],
  exports: [
    GnbComponent,
    GnbMenusComponent,
    GnbStatesComponent,
    GnbActionsComponent,
    GnbIndicatorsComponent,
    MapViewerComponent,
    MapToolbarComponent,
  ],
})
export class SharedModule {}
