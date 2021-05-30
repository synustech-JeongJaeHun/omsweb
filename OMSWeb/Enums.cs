namespace OMSWeb
{
  public enum HostSessionStatusEnums
  {
    Offline = 0,
    Online,
  }

  public enum HostModeEnums
  {
    Offline = 0,
    PM,
    OnlineRemote,
    OnlineLocal,
  }

  public enum TscModeEnums
  {
    Auto = 0,
    Pausing,
    Paused,
  }

  public enum UserPermissions
  {
    HostMode = 1,
    TscMode = 2,
    AiMode = 3,
    ViewHistory = 4,
    ViewPlayback = 5,
    ViewLog = 6,
    ViewSettings = 7,
    ViewAlarm = 8,
    ViewWarning = 9,
    ManualTransfer = 10,
    DeleteOrder = 11,
    CancelOrder = 12,
    AbortOrder = 13,
    EStopVehicle = 14,
    ResetVehicle = 15,
    ResetAllVehicle = 16,
    AutoVehicle = 17,
    AutoAllVehicle = 18,
    HostOrderEnable = 19,
    PushEnable = 20,
    RailIn = 21,
    RailOut = 22,
    SetZcuGo = 23,
    SetZcuUsingType = 24,
    SetHomePoint = 25,
    ViewBuffer = 26,
    ViewVehicleStatus = 27,
    ViewItemDetails = 28,
    SegmentUnuse = 29,
    UserManagement = 30,
    SettingPreference = 31,
    SettingGroup = 32,
    SettingCluster = 33,
    SettingAlarmList = 34,
    SettingSegment = 35,
    SettingPoint = 36,
    SettingZcu = 37,
    SettingStation = 38,
    ViewControl = 39,
  }
}