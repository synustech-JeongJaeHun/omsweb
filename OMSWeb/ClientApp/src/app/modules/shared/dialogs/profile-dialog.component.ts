import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ISessionUser } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'oms-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss'],
})
export class ProfileDialogComponent implements OnInit {
  form: FormGroup;

  private _user: ISessionUser;

  get f(): { [key: string]: FormControl } {
    return this.form.controls as { [key: string]: FormControl };
  }

  constructor(
    private auth: AuthService,
    private dialog: MatDialogRef<ProfileDialogComponent>
  ) {}

  ngOnInit(): void {
    this._user = this.auth.currentUser;
    this.initForm();
  }

  onSave() {
    const model = this.form.value;
    if (this.form.valid) {
      this.auth.updateProfile(model).subscribe(() => {
        this.dialog.close();
      });
    }
  }

  private passwordCompareValidator(
    ac: AbstractControl
  ): { [key: string]: boolean } {
    const password = ac.get('password').value;
    const confirm = ac.get('passwordConfirm').value;
    if (password !== confirm) {
      ac.get('passwordConfirm').setErrors({ missMatch: true });
      return { missMatch: true };
    }
    return null;
  }

  private initForm() {
    this.form = new FormGroup(
      {
        userId: new FormControl(this._user.userId, [Validators.required]),
        firstName: new FormControl(this._user.firstName, [Validators.required]),
        lastName: new FormControl(this._user.lastName, [Validators.required]),
        email: new FormControl(this._user.email, [Validators.email]),
        password: new FormControl('', [
          // Validators.required,
          Validators.minLength(4),
        ]),
        passwordConfirm: new FormControl('', [
          // Validators.required,
          Validators.minLength(4),
        ]),
      },
      this.passwordCompareValidator
    );
  }
}
