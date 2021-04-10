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
}

export interface ISessionUser extends ISimpleUser {
  roles?: number[]
  permissions?: number[];
}

export interface IUserToken extends ISessionUser, ITokenStamp {}
