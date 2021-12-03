import { error } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { AuthService } from '@oms/services/auth.service';
import { userInfo } from 'os';

@Component({
  selector: 'oms-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
})
export class LoginDialogComponent implements OnInit {
  form: FormGroup;
  loginInvalid = false;

  constructor(
    private authSvc: AuthService,
    private dialog: MatDialogRef<LoginDialogComponent>
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.form = new FormGroup({
      userId: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
    });
  }

  onKeyDownEvent($event) {
    this.loginInvalid = false;
  }

  onLogin() {
    if (this.form.invalid)
      return;

    this.loginInvalid = false;
    const model = this.form.value;
    this.authSvc.authenticate(model)
      .subscribe(
        result => {
          this.dialog.close(result);
        },
        error => {
          this.loginInvalid = true;
        }
      );
  }
}
