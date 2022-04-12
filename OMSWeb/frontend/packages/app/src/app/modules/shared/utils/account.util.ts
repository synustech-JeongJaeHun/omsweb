import { ISessionUser, ISimpleUser } from '@oms/models/user.model';

export namespace AccountUtil {
  export function hasPermission(needPermission: number, user: ISessionUser): boolean {
    return (!user) ? false : (user?.permissions ?? []).includes(needPermission)
  };

  export function hasPermissions(needPermissions: number[], user: ISessionUser): boolean {
    return (!user) ? false : needPermissions.some(p => hasPermission(p, user))
  }
}
