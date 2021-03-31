export interface ILoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface ISimpleUser {
  id: number;
  email: string;
  name: string;
  roles?: string[];
}

export interface ISessionUser extends ISimpleUser {
  permissions?: number;
}
