import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IProfileForm, ISessionUser } from '../../../models/user.model';

@Component({
  selector: 'oms-user-form-dialog',
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.scss'],
})
export class UserFormDialogComponent implements OnInit {
  addMode: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) private user: ISessionUser,
    private dialog: MatDialogRef<UserFormDialogComponent>
  ) {
    this.addMode = !this.user;
  }

  ngOnInit(): void {}

  onSubmit(form: IProfileForm) {
    this.dialog.close(form);
  }

  onCancel() {
    this.dialog.close();
  }
}
