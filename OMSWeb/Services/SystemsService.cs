using Microsoft.Extensions.Options;
using OMSWeb.Models;

namespace OMSWeb.Services
{
  public class SystemsService
  {
    private readonly AppSettings _appSettings;

    public SystemStatusModel HostStates { get; set; }

    public SystemsService(IOptions<AppSettings> appSettings)
    {
      this._appSettings = appSettings.Value;
      this.HostStates = new SystemStatusModel
      {
        HostMode = HostModeEnums.Offline,
        SessionStatus = HostSessionStatusEnums.Offline,
        TscMode = TscModeEnums.Auto,
        AiMode = true,
      };
    }

    public ClientSettings GetClientSettings()
    {
      var client = this._appSettings.Client;
      client.Version = this._appSettings.Version;
      client.KpiEnabled = this._appSettings.KpiEnabled;
      return this._appSettings.Client;
    }
  }
}