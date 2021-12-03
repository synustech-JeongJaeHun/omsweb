import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiStatusComponent } from './status/kpi-status.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [KpiStatusComponent],
  imports: [CommonModule, SharedModule],
  exports: [KpiStatusComponent],
})
export class KpiModule { }
