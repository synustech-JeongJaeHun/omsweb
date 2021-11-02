import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { MatCheckboxModule, MatCheckbox } from '@angular/material/checkbox';
import { Subject } from 'rxjs';
import { IControlTableEvent } from '../../../models/drawing.model';
import { ClientPreferences, ControlTable, defaultControlTable } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service';
import { type } from 'jquery';

@Component({
  selector: 'oms-column-display-management',
  templateUrl: './column-display-management.component.html',
  styleUrls: ['./column-display-management.component.scss'],
})
export class ColumnDisplayManagementComponent implements OnInit {
  preference: ClientPreferences;

  controlTableCommandEvent$ = new Subject<IControlTableEvent>();

  getCheckedState(target: string): boolean {
    const pref = this.preference;
    return pref.controlTables[target];
  }

  constructor(
    private settingSvc: SettingsService
  ) {
    this.preference = this.settingSvc.globalPreferences;
  }

  ngOnInit(): void { }

  onChangeControlTable(target: string, value: any) {
    this.changeControlTableState(target, value.currentTarget.checked);
  }  
  
  changeControlTableState(type: string, value: any) {
    const pref = this.preference;
    pref.controlTables[type] = value;
    pref.save();
    this.controlTableCommandEvent$.next({ type, value });
  }  
}
