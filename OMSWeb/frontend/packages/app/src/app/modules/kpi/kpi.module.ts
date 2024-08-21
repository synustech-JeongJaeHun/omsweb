import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiStatusComponent } from './status/kpi-status.component';
import { SharedModule } from '../shared/shared.module';
import { VhlStatusComponent } from './vhl-status/vhl-status.component';
import { ZcuStatusComponent } from './zcu-status/zcu-status.component';

@NgModule({
  declarations: [KpiStatusComponent, VhlStatusComponent, ZcuStatusComponent],
  imports: [CommonModule, SharedModule],
	exports: [KpiStatusComponent, VhlStatusComponent, ZcuStatusComponent],
})
export class KpiModule { }
