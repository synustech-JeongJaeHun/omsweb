import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormControl,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IProfileForm, IRole, ISessionUser } from '../../../models/user.model';
import { UsersService } from '../../../services/users.service';
import { UserDataRestriction } from '../../shared/utils/user.util'

@Component({
  selector: 'oms-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  @Input() user: ISessionUser;
  @Input() addMode: boolean = false;
  @Input() enableRole: boolean = false;
  @Output() save = new EventEmitter<IProfileForm>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  roles$: Observable<IRole[]>;

  private _formModel: IProfileForm;

  get f(): { [key: string]: FormControl } {
    return this.form.controls as { [key: string]: FormControl };
  }

  public UserDataRestriction = UserDataRestriction;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { usersInDraft: { userId: string }[] },
    private userSvc: UsersService) {
    this.roles$ = this.userSvc.roles();
  }

  ngOnInit() {
    const usersInDraft = this.data.usersInDraft
    this._formModel = Object.assign({}, this.user);

    this.form = new FormGroup(
      {
        userId: new FormControl(this._formModel.userId, [
          Validators.required,
          Validators.minLength(UserDataRestriction.UserId.Minlength),
          Validators.maxLength(UserDataRestriction.UserId.Maxlength),
        ]),
        firstName: new FormControl(this._formModel.firstName, [
          Validators.required,
          Validators.minLength(UserDataRestriction.FirstName.Minlength),
          Validators.maxLength(UserDataRestriction.FirstName.Maxlength)
        ]),
        lastName: new FormControl(this._formModel.lastName, [
          Validators.required,
          Validators.minLength(UserDataRestriction.LastName.Minlength),
          Validators.maxLength(UserDataRestriction.LastName.Maxlength)
        ]),
        email: new FormControl(this._formModel.email, [
          Validators.required,
          Validators.email,
          Validators.minLength(UserDataRestriction.Email.Minlength),
          Validators.maxLength(UserDataRestriction.Email.Maxlength)
        ]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(UserDataRestriction.Password.Minlength),
          Validators.maxLength(UserDataRestriction.Password.Maxlength)
        ]),
        passwordConfirm: new FormControl('', [
          Validators.required,
          Validators.minLength(UserDataRestriction.Password.Minlength),
          Validators.maxLength(UserDataRestriction.Password.Maxlength)
        ]),
        roles: new FormControl(this._formModel.roles, [
          Validators.required
        ]),
      },
      [function passwordCompareValidator(ac: AbstractControl) {
        const password = ac.get('password').value;
        const confirm = ac.get('passwordConfirm').value;
        if (password !== confirm) {
          ac.get('passwordConfirm').setErrors({ missMatch: true });
          return { missMatch: true };
        }
        return null;
      },
      function userIdExistValidator(ac: AbstractControl) {
        const userIdControl = ac.get('userId');
        const userId = userIdControl.value;
        if (usersInDraft.some(user => user.userId === userId)) {
          userIdControl.setErrors({ existUserId: true });
          return { existUserId: true }
        }
        return null;
      }]
    );
  }

  onSave() {
    const { passwordConfirm, ...rest } = this.form.value;

    if (this.form.valid)
      this.save.emit({ ...rest });
  }

  onCancel() {
    this.cancel.emit();
  }
}
