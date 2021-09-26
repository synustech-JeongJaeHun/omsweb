namespace OMSWeb
{
  public enum HostSessionStatusEnums
  {
    Offline = 0,
    Online,
  }

  public enum HostModeEnums
  {
    LOCAL = 0,
    HOST,
  }

  public enum TscModeEnums
  {
    INIT = 1,
    PAUSED,
    AUTO,
    PAUSING,
  }

  public enum UserPermissions
  {
    HostMode = 1,
    TscMode = 2,
    AiMode = 3,
    ViewHistory = 4,
    ViewPlayback = 5,
    ViewReport = 6,
    ViewLog = 7,
    ViewControl = 8,
    ViewSettings = 9,
    ViewAlarm = 10,
    ViewWarning = 11,
    ManualTransfer = 12,
    DeleteOrder = 13,
    CancelOrder = 14,
    AbortOrder = 15,
    EStopVehicle = 16,
    ResetVehicle = 17,
    ResetAllVehicle = 18,
    AutoVehicle = 19,
    AutoAllVehicle = 20,
    HostOrderEnable = 21,
    PushEnable = 22,
    RailIn = 23,
    RailOut = 24,
    SetZcuGo = 25,
    SetZcuUsingType = 26,
    SetHomePoint = 27,
    ViewBuffer = 28,
    ViewVehicleStatus = 29,
    ViewItemDetails = 30,
    SegmentUnuse = 31,
    UserManagement = 32,
    SettingPreference = 33,
    SettingGroup = 34,
    SettingCluster = 35,
    SettingAlarmList = 36,
    SettingSegment = 37,
    SettingStation = 38,
    SettingBuffer = 39,
    SettingZcu = 40,
  }
}