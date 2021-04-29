import { ITokenStamp } from "./base.model";

export interface ILoginForm {
  email: string;
  password: string;
  remember?: boolean;
}
export interface ISimpleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: number[]
}

export interface ISessionUser extends ISimpleUser {
  permissions?: number[];
}

export interface IUserToken extends ISessionUser, ITokenStamp {}

export interface IProfileForm {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles?: number[];
}

export interface IUserForm extends IProfileForm {
  id: string;
  isNew?: boolean;
}

export interface IRole extends IPermission {
  permissions?: number[];
}

export interface IPermission{
  id: number;
  name: string;
}
