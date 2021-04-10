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
    ViewMonitorStatus = 1,
    ViewMonitorHistory = 2,
    ViewMonitorMetrics = 3,
    ViewControlServer = 4,
    ViewControlVehicles = 5,
    ViewControlOrders = 6,
    ViewPlaybackPlayback = 7,
    ViewEditorTrack = 8,
    ViewSystemStatus = 9,
    ViewSystemHistory = 10,
    ViewAuthUsers = 11,
    ViewAuthRoles = 12,
    ModifyUserProfile = 13,
    GeneratePasswordReset = 14,
    AddModifyDeleteUsers = 15,
    AddModifyDeleteRoles = 16,
    StartStopServers = 17,
    ChangeConfiguration = 18,
    ChangeMap = 19,
    ManageOrders = 20,
    ManageVehicles = 21,
    ModifyDisplaySettings = 22,
    ViewControlTests = 23,
  }
}