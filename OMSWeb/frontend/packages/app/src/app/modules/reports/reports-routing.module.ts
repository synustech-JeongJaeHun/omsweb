import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import {PageUnloadGuard} from "../../guards/page-unload.guard";

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    canDeactivate: [PageUnloadGuard],
    children: [
      // { path: '**', component: ReportsComponent},
      { path: 'kpi', component: ReportsComponent },
      { path: 'normalTR', component: ReportsComponent },
      { path: '', redirectTo: 'normalTR', pathMatch: 'full' },
      { path: 'abnormalTR', component: ReportsComponent },
      { path: 'alarm', component: ReportsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule { }
