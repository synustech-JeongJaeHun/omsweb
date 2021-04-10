import { ISessionUser, ISimpleUser } from '@oms/models/user.model';

export namespace AccountUtil {
  export const hasPermission = (
    needPermission: number,
    user: ISessionUser
  ): boolean => {
    if (!user) return false;
    const { permissions = [] } = user;
    return (permissions.includes(needPermission));
  };
}
