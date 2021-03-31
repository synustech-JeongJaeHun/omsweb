import { ISessionUser, ISimpleUser } from '@oms/models/user.model';

export namespace AccountUtil {
  export const hasPermission = (
    needPermission: number,
    user: ISessionUser
  ): boolean => {
    if (!user) return false;
    const { permissions = 0 } = user;
    return (user.permissions & needPermission) > 0;
  };
}
