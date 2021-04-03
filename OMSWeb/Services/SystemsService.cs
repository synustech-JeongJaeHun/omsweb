using OMSWeb.Models;

namespace OMSWeb.Services
{
  public class SystemsService
  {
    public SystemStatusModel HostStates { get; set; }

    public SystemsService()
    {
      this.HostStates = new SystemStatusModel
      {
        HostMode = HostModeEnums.Offline,
        SessionStatus = HostSessionStatusEnums.Offline,
        TscMode = TscModeEnums.Auto,
      };
    }
  }
}