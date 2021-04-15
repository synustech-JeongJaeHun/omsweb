import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { AuthService } from '@oms/services/auth.service';

@Component({
  selector: 'oms-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
})
export class LoginDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    private authSvc: AuthService,
    private dialog: MatDialogRef<LoginDialogComponent>
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  onLogin() {
    if (this.form.invalid) return;
    const model = this.form.value;
    this.authSvc.authenticate(model).subscribe((res) => {
      console.info('### auth result >>', res);
      this.dialog.close(res);
    });
  }

  private initForm() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
    });
  }
}
