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
    DEFAULT = 0,
    INIT,
    PAUSED,
    AUTO,
    PAUSING,
  }

  public enum UserPermissions
  {
    HostMode = 1,
    TscMode = 2,
    AiMode = 3,
    ViewMonitorStatus = 4,
    ViewHistory = 5,
    ViewPlayback = 6,
    ViewReport = 7,
    ViewLog = 8,
    ViewControl = 9,
    ViewSettings = 10,

    ViewAlarm = 11,
    ViewWarning = 12,
    ManualTransfer = 13,
    DeleteOrder = 14,
    CancelOrder = 15,
    AbortOrder = 16,
    EstopVehicle = 17,
    ResetVehicle = 18,
    ResetAllVehicle = 19,
    AutoVehicle = 20,

    AutoAllVehicle = 21,
    HostOrderEnable = 22,
    PushEnable = 23,
    RailIn = 24,
    RailOut = 25,
    SetZcuGo = 26,
    SetZcuUsingType = 27,
    SetHomePoint = 28,
    ViewBuffer = 29,
    ViewVehicleStatus = 30,

    ViewItemDetails = 31,
    SegmentUnuse = 32,
    UserManagement = 33,
    SettingPreference = 34,
    SettingGroup = 35,
    SettingCluster = 36,
    SettingAlarmList = 37,
    SettingSegment = 38,
    SettingStation = 39,
    SettingBuffer = 40,

    SettingZcu = 41,
    SettingVehicle = 42
  }
  
  public enum DisplayType
  {
      Id = 2,
      LogicalId = 3,
      Alias = 4,
  }
}