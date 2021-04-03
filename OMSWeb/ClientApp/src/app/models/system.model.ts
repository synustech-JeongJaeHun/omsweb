import { HostModeEnums, HostSessionStatusEnums, TscModeEnums } from '@oms/models/enums';

export interface ISystemStates {
  sessionStatus?: HostSessionStatusEnums;
  hostMode?: HostModeEnums;
  tscMode?: TscModeEnums;
}
