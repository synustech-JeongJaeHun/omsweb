import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { MatCheckboxModule, MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'oms-column-display-management',
  templateUrl: './column-display-management.component.html',
  styleUrls: ['./column-display-management.component.scss'],
})
export class ColumnDisplayManagementComponent implements OnInit {

  ngOnInit(): void { }

  onSave() {

  }
  onRevert() {

  }
}
