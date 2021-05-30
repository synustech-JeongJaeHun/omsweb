import { HostModeEnums, HostSessionStatusEnums, TscModeEnums } from '@oms/models/enums';

export interface ISystemStates {
  sessionStatus?: HostSessionStatusEnums;
  hostMode?: HostModeEnums;
  tscMode?: TscModeEnums;
  aiMode?: boolean;
}


export interface IServiceProcessStates {
  name: string;
  version: string;
  isRunning: boolean;
}
