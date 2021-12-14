import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormControl,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { IProfileForm, IRole, ISessionUser } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
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

  constructor(private auth: AuthService, private userSvc: UsersService) {
    this.roles$ = this.userSvc.roles();
  }

  ngOnInit(): void {
    this.initForm();
  }

  onSave() {
    const { passwordConfirm, ...rest } = this.form.value;
    this.form.valid && this.save.emit({ ...rest });
  }

  onCancel() {
    this.cancel.emit();
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
      this.passwordCompareValidator
    );
  }
}
